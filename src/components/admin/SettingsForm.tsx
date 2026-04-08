"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

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

  function update(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
              Frais de livraison locale (€)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={data.lac_delivery_fee ?? ""}
              onChange={(e) => update("lac_delivery_fee", e.target.value)}
              className={inputClass}
            />
          </div>
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
