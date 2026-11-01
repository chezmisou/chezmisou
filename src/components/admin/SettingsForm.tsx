"use client";

import { useState, type FormEvent } from "react";
import { Church, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_LAC_DELIVERY_ORIGIN,
  parseChurches,
  parseTiers,
  type LacChurch,
} from "@/lib/lac-delivery";

interface TierRow {
  upToKm: string;
  price: string;
}

function newId() {
  return `eg_${Math.random().toString(36).slice(2, 10)}`;
}

const DAYS = [
  { value: "monday", label: "Lundi" },
  { value: "tuesday", label: "Mardi" },
  { value: "wednesday", label: "Mercredi" },
  { value: "thursday", label: "Jeudi" },
  { value: "friday", label: "Vendredi" },
  { value: "saturday", label: "Samedi" },
  { value: "sunday", label: "Dimanche" },
];

interface SettingsFormProps {
  initialData: Record<string, string>;
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [data, setData] = useState<Record<string, string>>(initialData);
  const [saving, setSaving] = useState(false);
  const [churches, setChurches] = useState<LacChurch[]>(() =>
    parseChurches(initialData.lac_churches)
  );
  // Tous les paliers sauf le dernier (« au-delà »), plus le prix de ce dernier
  const [tierRows, setTierRows] = useState<TierRow[]>(() =>
    parseTiers(initialData.lac_delivery_tiers)
      .filter((t) => t.upToKm !== null)
      .map((t) => ({ upToKm: String(t.upToKm), price: String(t.price) }))
  );
  const [beyondPrice, setBeyondPrice] = useState<string>(() => {
    const tiers = parseTiers(initialData.lac_delivery_tiers);
    return String(tiers[tiers.length - 1].price);
  });

  function update(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function updateChurch(id: string, field: "name" | "address", value: string) {
    setChurches((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function updateTier(index: number, field: keyof TierRow, value: string) {
    setTierRows((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTier() {
    setTierRows((prev) => {
      const last = prev[prev.length - 1];
      const nextKm = last ? Number(last.upToKm) + 10 : 10;
      return [...prev, { upToKm: String(nextKm), price: beyondPrice }];
    });
  }

  /** Vérifie et met en forme les églises et la grille pour l'enregistrement. */
  function buildLacSettings(): { churches: string; tiers: string } | string {
    const cleanChurches = churches
      .map((c) => ({ ...c, name: c.name.trim(), address: c.address.trim() }))
      .filter((c) => c.name || c.address);
    if (cleanChurches.some((c) => !c.name)) return "Chaque église doit avoir un nom.";

    const rows = tierRows.map((t) => ({ upToKm: Number(t.upToKm), price: Number(t.price) }));
    if (rows.some((t) => !Number.isFinite(t.upToKm) || t.upToKm <= 0))
      return "Chaque palier doit avoir une distance supérieure à 0 km.";
    if (rows.some((t) => !Number.isFinite(t.price) || t.price < 0))
      return "Chaque palier doit avoir un prix.";
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].upToKm <= rows[i - 1].upToKm)
        return "Les distances des paliers doivent être croissantes.";
    }
    const beyond = Number(beyondPrice);
    if (beyondPrice.trim() === "" || !Number.isFinite(beyond) || beyond < 0)
      return "Indiquez le prix au-delà du dernier palier.";

    return {
      churches: JSON.stringify(cleanChurches),
      tiers: JSON.stringify([...rows, { upToKm: null, price: beyond }]),
    };
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const lac = buildLacSettings();
    if (typeof lac === "string") {
      toast.error(lac);
      return;
    }
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lac_churches: lac.churches,
          lac_delivery_tiers: lac.tiers,
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success("Paramètres enregistrés avec succès");
      window.location.reload();
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-marron-profond/20 outline-none transition-all focus:border-orange focus:ring-1 focus:ring-orange/30 font-sans";

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Section 1 — Épicerie fine */}
      <section>
        <h2 className="font-serif text-2xl text-marron-profond mb-6">
          Épicerie fine
        </h2>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Frais de port France métropolitaine (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.shipping_cost_france ?? ""}
              onChange={(e) => update("shipping_cost_france", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Seuil livraison offerte (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.free_shipping_threshold ?? ""}
              onChange={(e) => update("free_shipping_threshold", e.target.value)}
              className={inputClass}
            />
            <p className="text-xs text-gris-chaud mt-1">
              &Agrave; partir de ce montant d&apos;achat, la livraison sera offerte.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Lunch After Church */}
      <section>
        <h2 className="font-serif text-2xl text-marron-profond mb-6">
          Lunch After Church
        </h2>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Jour de deadline par défaut
            </label>
            <select
              value={data.lac_default_deadline_day ?? "saturday"}
              onChange={(e) =>
                update("lac_default_deadline_day", e.target.value)
              }
              className={inputClass}
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Heure de deadline par défaut
            </label>
            <input
              type="time"
              value={data.lac_default_deadline_time ?? "18:00"}
              onChange={(e) =>
                update("lac_default_deadline_time", e.target.value)
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Adresse de retrait par défaut
            </label>
            <textarea
              value={data.pickup_address ?? ""}
              onChange={(e) => update("pickup_address", e.target.value)}
              className={inputClass}
              rows={3}
              placeholder="Sera utilisée comme placeholder dans le formulaire de création de menu LAC"
            />
          </div>
        </div>

        {/* Églises de retrait */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4 mt-6">
          <div>
            <h3 className="font-serif text-lg text-marron-profond">Églises de retrait</h3>
            <p className="text-xs text-gris-chaud mt-1">
              Le client choisit l&apos;église où récupérer sa commande, gratuitement.
            </p>
          </div>
          {churches.length === 0 && (
            <p className="text-sm text-gris-chaud italic">
              Aucune église pour l&apos;instant : le client verra un simple « Retrait sur place ».
            </p>
          )}
          {churches.map((church) => (
            <div
              key={church.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.4fr_auto] gap-3 items-start p-3 rounded-xl bg-blanc-creme/60 border border-marron-doux/15"
            >
              <input
                type="text"
                value={church.name}
                onChange={(e) => updateChurch(church.id, "name", e.target.value)}
                className={inputClass}
                placeholder="Nom de l'église"
                aria-label="Nom de l'église"
              />
              <input
                type="text"
                value={church.address}
                onChange={(e) => updateChurch(church.id, "address", e.target.value)}
                className={inputClass}
                placeholder="Adresse"
                aria-label="Adresse de l'église"
              />
              <button
                type="button"
                onClick={() => setChurches((prev) => prev.filter((c) => c.id !== church.id))}
                className="p-2.5 rounded-xl text-gris-chaud hover:text-red-600 hover:bg-red-50 transition-colors justify-self-end"
                aria-label={`Supprimer ${church.name || "cette église"}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setChurches((prev) => [...prev, { id: newId(), name: "", address: "" }])
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange hover:text-orange-vif"
          >
            <Church size={16} />
            Ajouter une église
          </button>
        </div>

        {/* Livraison selon la distance */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5 mt-6">
          <div>
            <h3 className="font-serif text-lg text-marron-profond">Livraison à domicile (Île-de-France)</h3>
            <p className="text-xs text-gris-chaud mt-1">
              Le prix est calculé automatiquement selon la distance à vol d&apos;oiseau entre
              l&apos;adresse de départ et l&apos;adresse du client.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Adresse de départ
            </label>
            <input
              type="text"
              value={data.lac_delivery_origin ?? ""}
              onChange={(e) => update("lac_delivery_origin", e.target.value)}
              className={inputClass}
              placeholder={DEFAULT_LAC_DELIVERY_ORIGIN}
            />
            <p className="text-xs text-gris-chaud mt-1">
              Vide = centre de Chelles. Mettez l&apos;adresse exacte de la cuisine pour plus de précision.
            </p>
          </div>

          <div>
            <p className="block text-sm font-medium text-text-body mb-2">Grille de prix</p>
            <div className="space-y-2">
              {tierRows.map((row, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-text-body w-24">
                    {i === 0 ? "0" : tierRows[i - 1].upToKm || "…"} km à
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={row.upToKm}
                    onChange={(e) => updateTier(i, "upToKm", e.target.value)}
                    className={`${inputClass} !w-24`}
                    aria-label={`Distance maximale du palier ${i + 1} (km)`}
                  />
                  <span className="text-text-body">km :</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={row.price}
                    onChange={(e) => updateTier(i, "price", e.target.value)}
                    className={`${inputClass} !w-28`}
                    aria-label={`Prix du palier ${i + 1} (€)`}
                  />
                  <span className="text-text-body">€</span>
                  <button
                    type="button"
                    onClick={() => setTierRows((prev) => prev.filter((_, j) => j !== i))}
                    className="p-2 rounded-lg text-gris-chaud hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={`Supprimer le palier ${i + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-text-body">
                  {tierRows.length > 0
                    ? `Plus de ${tierRows[tierRows.length - 1].upToKm || "…"} km :`
                    : "Toute distance :"}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={beyondPrice}
                  onChange={(e) => setBeyondPrice(e.target.value)}
                  className={`${inputClass} !w-28`}
                  aria-label="Prix au-delà du dernier palier (€)"
                />
                <span className="text-text-body">€</span>
              </div>
            </div>
            <button
              type="button"
              onClick={addTier}
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange hover:text-orange-vif"
            >
              <Plus size={16} />
              Ajouter un palier
            </button>
          </div>
        </div>
      </section>

      {/* Section 3 — Contact */}
      <section>
        <h2 className="font-serif text-2xl text-marron-profond mb-6">
          Contact
        </h2>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Email de contact public
            </label>
            <input
              type="email"
              value={data.contact_email ?? ""}
              onChange={(e) => update("contact_email", e.target.value)}
              className={inputClass}
              placeholder="contact@chezmisou.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Téléphone de contact public
            </label>
            <input
              type="tel"
              value={data.contact_phone ?? ""}
              onChange={(e) => update("contact_phone", e.target.value)}
              className={inputClass}
              placeholder="+33 6 00 00 00 00"
            />
          </div>
          <p className="text-xs text-gris-chaud">
            Ces informations seront affichées dans le footer du site et les emails de confirmation.
          </p>
        </div>
      </section>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-orange text-blanc px-8 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save size={18} />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </form>
  );
}
