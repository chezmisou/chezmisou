/**
 * Mode de récupération du LAC : églises de retrait et grille de prix de
 * livraison selon la distance depuis Chelles.
 *
 * Ce fichier ne dépend pas de la base : il est utilisable côté client
 * (page de commande, Admin) comme côté serveur.
 */

export interface LacChurch {
  id: string;
  name: string;
  address: string;
}

/** Palier de prix : jusqu'à `upToKm` km (null = au-delà du dernier palier). */
export interface LacDeliveryTier {
  upToKm: number | null;
  price: number;
}

export const DEFAULT_LAC_DELIVERY_TIERS: LacDeliveryTier[] = [
  { upToKm: 10, price: 5 },
  { upToKm: 20, price: 8 },
  { upToKm: 30, price: 11 },
  { upToKm: 40, price: 14 },
  { upToKm: null, price: 17 },
];

export const DEFAULT_LAC_DELIVERY_ORIGIN = "Chelles 77500";

/** Départements d'Île-de-France. */
export const IDF_DEPARTMENTS = ["75", "77", "78", "91", "92", "93", "94", "95"];

export function isIdfPostcode(postcode: string | null | undefined): boolean {
  if (!postcode) return false;
  return IDF_DEPARTMENTS.includes(postcode.trim().slice(0, 2));
}

export function parseChurches(raw: string | null | undefined): LacChurch[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (c): c is LacChurch =>
          c && typeof c.id === "string" && typeof c.name === "string" && c.name.trim() !== ""
      )
      .map((c) => ({
        id: c.id,
        name: c.name.trim(),
        address: typeof c.address === "string" ? c.address.trim() : "",
      }));
  } catch {
    return [];
  }
}

/**
 * Lit la grille enregistrée. Les paliers sont triés par distance et le
 * dernier couvre toujours « au-delà », pour qu'une adresse en Île-de-France
 * ait toujours un prix.
 */
export function parseTiers(raw: string | null | undefined): LacDeliveryTier[] {
  let tiers: LacDeliveryTier[] = [];
  if (raw) {
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        tiers = data
          .map((t) => ({
            upToKm:
              t?.upToKm === null || t?.upToKm === "" || t?.upToKm === undefined
                ? null
                : Number(t.upToKm),
            price: Number(t?.price),
          }))
          .filter(
            (t) =>
              Number.isFinite(t.price) &&
              t.price >= 0 &&
              (t.upToKm === null || (Number.isFinite(t.upToKm) && t.upToKm > 0))
          );
      }
    } catch {
      tiers = [];
    }
  }
  if (tiers.length === 0) return DEFAULT_LAC_DELIVERY_TIERS;

  const bounded = tiers
    .filter((t) => t.upToKm !== null)
    .sort((a, b) => (a.upToKm as number) - (b.upToKm as number));
  const open = tiers.find((t) => t.upToKm === null);
  const last = open ?? { upToKm: null, price: bounded[bounded.length - 1].price };
  return [...bounded, { upToKm: null, price: last.price }];
}

export function priceForDistance(distanceKm: number, tiers: LacDeliveryTier[]): number {
  for (const tier of tiers) {
    if (tier.upToKm === null || distanceKm <= tier.upToKm) return tier.price;
  }
  return tiers[tiers.length - 1]?.price ?? 0;
}

/** Distance à vol d'oiseau en km entre deux points (lat/lon en degrés). */
export function haversineKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Libellé d'une église tel qu'il est enregistré sur la commande. */
export function churchLabel(church: LacChurch): string {
  return church.address ? `${church.name} — ${church.address}` : church.name;
}

/** Texte lisible d'un palier, ex. « Jusqu'à 10 km » / « Au-delà de 40 km ». */
export function tierLabel(tiers: LacDeliveryTier[], index: number): string {
  const tier = tiers[index];
  if (tier.upToKm !== null) {
    const from = index > 0 ? tiers[index - 1].upToKm : 0;
    return `${from} à ${tier.upToKm} km`;
  }
  const prev = index > 0 ? tiers[index - 1].upToKm : null;
  return prev ? `Plus de ${prev} km` : "Toute distance";
}
