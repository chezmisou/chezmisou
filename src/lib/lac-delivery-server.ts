import { getStringSetting, SETTING_KEYS } from "@/lib/settings";
import {
  DEFAULT_LAC_DELIVERY_ORIGIN,
  haversineKm,
  isIdfPostcode,
  parseChurches,
  parseTiers,
  priceForDistance,
  type LacChurch,
  type LacDeliveryTier,
} from "@/lib/lac-delivery";

/**
 * Géocodage via le service public de l'IGN (ex-API Adresse de la BAN) :
 * gratuit, sans clé, adresses françaises.
 */
const GEOCODE_URL = "https://data.geopf.fr/geocodage/search";

/** Centre de Chelles, utilisé si l'adresse de départ ne peut pas être géocodée. */
const CHELLES_FALLBACK = { lat: 48.8814, lon: 2.5935 };

export interface GeocodedAddress {
  label: string;
  line1: string;
  postalCode: string;
  city: string;
  lat: number;
  lon: number;
  score: number;
}

interface GeoFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    label?: string;
    name?: string;
    postcode?: string;
    city?: string;
    score?: number;
    type?: string;
  };
}

function toAddress(f: GeoFeature): GeocodedAddress | null {
  const coords = f.geometry?.coordinates;
  const p = f.properties;
  if (!coords || !p?.postcode) return null;
  return {
    label: p.label || "",
    line1: p.type === "municipality" ? "" : p.name || "",
    postalCode: p.postcode,
    city: p.city || "",
    lon: coords[0],
    lat: coords[1],
    score: p.score ?? 0,
  };
}

export async function searchAddresses(
  query: string,
  { limit = 5, autocomplete = true }: { limit?: number; autocomplete?: boolean } = {}
): Promise<GeocodedAddress[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = new URL(GEOCODE_URL);
  url.searchParams.set("q", q.slice(0, 200));
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("index", "address");
  url.searchParams.set("autocomplete", autocomplete ? "1" : "0");

  const res = await fetch(url, {
    signal: AbortSignal.timeout(6000),
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Géocodage indisponible (${res.status})`);
  const data = (await res.json()) as { features?: GeoFeature[] };
  return (data.features ?? [])
    .map(toAddress)
    .filter((a): a is GeocodedAddress => a !== null);
}

export async function getLacPickupSettings(): Promise<{
  churches: LacChurch[];
  tiers: LacDeliveryTier[];
  origin: string;
}> {
  const [churchesRaw, tiersRaw, origin] = await Promise.all([
    getStringSetting(SETTING_KEYS.LAC_CHURCHES.key, SETTING_KEYS.LAC_CHURCHES.default),
    getStringSetting(SETTING_KEYS.LAC_DELIVERY_TIERS.key, SETTING_KEYS.LAC_DELIVERY_TIERS.default),
    getStringSetting(SETTING_KEYS.LAC_DELIVERY_ORIGIN.key, SETTING_KEYS.LAC_DELIVERY_ORIGIN.default),
  ]);
  return {
    churches: parseChurches(churchesRaw),
    tiers: parseTiers(tiersRaw),
    origin: origin.trim() || DEFAULT_LAC_DELIVERY_ORIGIN,
  };
}

const originCache = new Map<string, { lat: number; lon: number }>();

async function geocodeOrigin(origin: string) {
  const cached = originCache.get(origin);
  if (cached) return cached;
  try {
    const [hit] = await searchAddresses(origin, { limit: 1, autocomplete: false });
    if (hit) {
      const point = { lat: hit.lat, lon: hit.lon };
      originCache.set(origin, point);
      return point;
    }
  } catch (err) {
    console.error("[lac-delivery] Géocodage de l'adresse de départ impossible:", err);
  }
  return CHELLES_FALLBACK;
}

export type LacDeliveryQuote =
  | { ok: true; distanceKm: number; fee: number; matchedLabel: string }
  | { ok: false; error: string };

/**
 * Calcule le prix de livraison d'une adresse. C'est la seule source de
 * vérité : la page de commande l'affiche, le serveur le recalcule au paiement.
 */
export async function quoteLacDelivery(address: {
  line1: string;
  postalCode: string;
  city: string;
}): Promise<LacDeliveryQuote> {
  if (!isIdfPostcode(address.postalCode)) {
    return {
      ok: false,
      error: "La livraison est possible uniquement en Île-de-France.",
    };
  }

  let match: GeocodedAddress | undefined;
  try {
    const hits = await searchAddresses(
      `${address.line1} ${address.postalCode} ${address.city}`,
      { limit: 1, autocomplete: false }
    );
    match = hits[0];
  } catch (err) {
    console.error("[lac-delivery] Géocodage impossible:", err);
    return {
      ok: false,
      error: "Impossible de calculer la livraison pour le moment. Réessayez dans un instant.",
    };
  }

  if (!match || match.score < 0.4) {
    return {
      ok: false,
      error: "Adresse introuvable. Vérifiez-la ou choisissez-la dans la liste proposée.",
    };
  }
  if (!isIdfPostcode(match.postalCode)) {
    return {
      ok: false,
      error: "La livraison est possible uniquement en Île-de-France.",
    };
  }

  const { tiers, origin } = await getLacPickupSettings();
  const from = await geocodeOrigin(origin);
  const distanceKm = Math.round(haversineKm(from, match) * 10) / 10;
  return {
    ok: true,
    distanceKm,
    fee: priceForDistance(distanceKm, tiers),
    matchedLabel: match.label,
  };
}
