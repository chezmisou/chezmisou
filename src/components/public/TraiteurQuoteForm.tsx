"use client";

import { useState, useMemo } from "react";
import { useTraiteurSelection } from "@/lib/traiteur/TraiteurSelectionContext";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface Format {
  id: string;
  minPeople: number;
  maxPeople: number;
  indicativePricePerPerson: number;
}

interface Dish {
  id: string;
  name: string;
  category: string | null;
  formats: Format[];
}

interface Props {
  dishes: Dish[];
}

const eventTypes = [
  { value: "", label: "Sélectionner…" },
  { value: "Anniversaire", label: "Anniversaire" },
  { value: "Fête de famille", label: "Fête de famille" },
  { value: "Plateaux repas", label: "Plateaux repas" },
  { value: "Autre", label: "Autre" },
];

export default function TraiteurQuoteForm({ dishes }: Props) {
  const { selectedDishIds, clear } = useTraiteurSelection();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentQuoteNumber, setSentQuoteNumber] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    eventDate: "",
    eventType: "",
    nbPeople: 10,
    eventLocation: "",
    message: "",
  });

  const selectedDishes = dishes.filter((d) => selectedDishIds.has(d.id));

  const estimation = useMemo(() => {
    if (selectedDishes.length === 0 || !form.nbPeople) return null;

    let total = 0;
    let hasCustom = false;

    for (const dish of selectedDishes) {
      const matched = dish.formats.find(
        (f) => form.nbPeople >= f.minPeople && form.nbPeople <= f.maxPeople
      );
      if (matched) {
        total += matched.indicativePricePerPerson * form.nbPeople;
      } else {
        hasCustom = true;
      }
    }

    return { total, hasCustom };
  }, [selectedDishes, form.nbPeople]);

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDishes.length === 0) {
      toast.error("Sélectionnez au moins un plat");
      return;
    }

    if (!form.name || !form.email || !form.phone || !form.eventDate || !form.nbPeople) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const eventDate = new Date(form.eventDate);
    if (eventDate <= new Date()) {
      toast.error("La date de l'événement doit être dans le futur");
      return;
    }

    setSending(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        eventDate: form.eventDate,
        eventType: form.eventType || null,
        nbPeople: form.nbPeople,
        eventLocation: form.eventLocation || null,
        message: form.message || null,
        selectedDishes: selectedDishes.map((d) => ({
          dishId: d.id,
          dishName: d.name,
        })),
      };

      const res = await fetch("/api/quote-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de l'envoi");
        return;
      }

      const data = await res.json();
      setSentQuoteNumber(data.quoteNumber);
      setSent(true);
      clear();
    } catch {
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-16 px-4">
        <CheckCircle2 size={64} className="mx-auto text-green-500 mb-6" />
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-marron-profond mb-4">
          Votre demande est bien envoyée
        </h2>
        <p className="text-lg text-text-body max-w-md mx-auto mb-2">
          Misou va vous recontacter sous 48h au numéro que vous nous avez communiqué.
        </p>
        {sentQuoteNumber && (
          <p className="text-sm text-gris-chaud mb-8">
            Référence : {sentQuoteNumber}
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange text-blanc px-6 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  if (selectedDishes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gris-chaud">
          Sélectionnez au moins un plat pour demander un devis.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Summary of selected dishes */}
      <div className="bg-orange/5 rounded-xl p-4 border border-orange/20">
        <p className="text-sm font-semibold text-marron-profond mb-2">
          {selectedDishes.length} plat{selectedDishes.length > 1 ? "s" : ""} sélectionné{selectedDishes.length > 1 ? "s" : ""} :
        </p>
        <ul className="space-y-1">
          {selectedDishes.map((d) => (
            <li key={d.id} className="text-sm text-text-body">
              • {d.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Nom *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Email *
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Date de l&apos;événement */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Date de l&apos;événement *
          </label>
          <input
            type="date"
            required
            value={form.eventDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => updateField("eventDate", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Type d&apos;événement */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Type d&apos;événement
          </label>
          <select
            value={form.eventType}
            onChange={(e) => updateField("eventType", e.target.value)}
            className={inputClass}
          >
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre de personnes */}
        <div>
          <label className="block text-sm font-semibold text-marron-profond mb-1.5">
            Nombre de personnes *
          </label>
          <input
            type="number"
            required
            min={5}
            max={50}
            value={form.nbPeople}
            onChange={(e) => updateField("nbPeople", parseInt(e.target.value) || 5)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Lieu */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Lieu de l&apos;événement
        </label>
        <input
          type="text"
          value={form.eventLocation}
          onChange={(e) => updateField("eventLocation", e.target.value)}
          placeholder="Adresse ou ville"
          className={inputClass}
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Message
        </label>
        <textarea
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          rows={4}
          placeholder="Précisions, demandes particulières, allergies…"
          className={inputClass}
        />
      </div>

      {/* Estimation */}
      {estimation && (
        <div className="bg-blanc-creme rounded-xl p-4 border border-marron-doux/20">
          {estimation.total > 0 && (
            <p className="text-lg font-serif font-bold text-marron-profond">
              Estimation indicative : ~{" "}
              {new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
              }).format(estimation.total)}
            </p>
          )}
          {estimation.hasCustom && (
            <p className="text-sm text-orange mt-1">
              Certains plats nécessitent un devis sur mesure pour ce volume. Misou vous recontactera.
            </p>
          )}
          {estimation.total > 0 && !estimation.hasCustom && (
            <p className="text-xs text-gris-chaud mt-1">
              Ce montant sera confirmé dans votre devis personnalisé.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full bg-orange text-blanc py-3.5 rounded-xl font-semibold text-lg hover:bg-orange-vif transition-colors disabled:opacity-50"
      >
        {sending ? "Envoi en cours…" : "Envoyer ma demande de devis"}
      </button>
    </form>
  );
}
