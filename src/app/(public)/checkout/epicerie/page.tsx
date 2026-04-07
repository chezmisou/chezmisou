"use client";

import { useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "LU", label: "Luxembourg" },
  { code: "CH", label: "Suisse" },
];

const SHIPPING_COST = 6.9;
const FREE_SHIPPING_THRESHOLD = 60;

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  country: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function CheckoutEpiceriePage() {
  const { items, subtotal } = useCart();

  const [form, setForm] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    country: "FR",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <section className="flex items-center justify-center min-h-[60vh] px-6 text-center">
        <div>
          <p className="font-sans text-lg text-text-body mb-6">
            Votre panier est vide.
          </p>
          <Link
            href="/epicerie"
            className="inline-block px-8 py-4 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
          >
            Retour &agrave; l&rsquo;&eacute;picerie
          </Link>
        </div>
      </section>
    );
  }

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "L'email n'est pas valide";
    if (!form.firstName.trim()) errs.firstName = "Le prénom est requis";
    if (!form.lastName.trim()) errs.lastName = "Le nom est requis";
    if (!form.line1.trim()) errs.line1 = "L'adresse est requise";
    if (!form.postalCode.trim())
      errs.postalCode = "Le code postal est requis";
    if (!form.city.trim()) errs.city = "La ville est requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        items: items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
        address: {
          line1: form.line1,
          line2: form.line2,
          postalCode: form.postalCode,
          city: form.city,
          country: form.country,
        },
        notes: form.notes,
      };

      const res = await fetch("/api/checkout/epicerie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Une erreur est survenue");
        setIsSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch {
      setSubmitError("Impossible de contacter le serveur. Réessayez.");
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  const inputClass = (field: string) =>
    `w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-sans ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300"
        : "border-marron-profond/20 focus:border-orange focus:ring-1 focus:ring-orange/30"
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        href="/epicerie"
        className="inline-flex items-center gap-1 text-sm text-text-body hover:text-orange transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Retour &agrave; l&rsquo;&eacute;picerie
      </Link>

      <h1 className="font-serif text-3xl md:text-4xl text-marron-profond mb-8">
        Finaliser votre commande
      </h1>

      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-sans">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Column — Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Customer Info */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Vos coordonn&eacute;es
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClass("email")}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1">
                      Pr&eacute;nom *
                    </label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) =>
                        updateField("firstName", e.target.value)
                      }
                      className={inputClass("firstName")}
                      placeholder="Marie"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) =>
                        updateField("lastName", e.target.value)
                      }
                      className={inputClass("lastName")}
                      placeholder="Jean-Baptiste"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    T&eacute;l&eacute;phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass("phone")}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Adresse de livraison
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={form.line1}
                    onChange={(e) => updateField("line1", e.target.value)}
                    className={inputClass("line1")}
                    placeholder="12 rue des Lilas"
                  />
                  {errors.line1 && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.line1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Compl&eacute;ment d&rsquo;adresse
                  </label>
                  <input
                    type="text"
                    value={form.line2}
                    onChange={(e) => updateField("line2", e.target.value)}
                    className={inputClass("line2")}
                    placeholder="B&acirc;t. A, 3e &eacute;tage"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1">
                      Code postal *
                    </label>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) =>
                        updateField("postalCode", e.target.value)
                      }
                      className={inputClass("postalCode")}
                      placeholder="75001"
                    />
                    {errors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.postalCode}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      className={inputClass("city")}
                      placeholder="Paris"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.city}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-body mb-1">
                    Pays
                  </label>
                  <select
                    value={form.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={inputClass("country")}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Notes pour Misou
              </h2>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className={inputClass("notes")}
                rows={3}
                placeholder="Instructions sp&eacute;ciales, allergies…"
              />
            </div>

            {/* Submit Button mobile */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:hidden py-4 rounded-xl font-semibold text-lg text-blanc bg-orange hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Redirection vers le paiement…
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Payer {priceFormatter.format(total)}
                </>
              )}
            </button>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-blanc rounded-2xl p-6 lg:sticky lg:top-24 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                R&eacute;capitulatif
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm font-sans"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-marron-profond truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gris-chaud">
                        {item.variantName} &times; {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-text-body ml-3 whitespace-nowrap">
                      {priceFormatter.format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-marron-profond/10 pt-4 space-y-2 font-sans">
                <div className="flex justify-between text-sm text-text-body">
                  <span>Sous-total</span>
                  <span>{priceFormatter.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-body">
                  <span>Frais de port</span>
                  <span
                    className={
                      shippingCost === 0 ? "font-bold text-green-600" : ""
                    }
                  >
                    {shippingCost === 0
                      ? "Offerts !"
                      : priceFormatter.format(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-marron-profond/10">
                  <span className="text-marron-profond">Total</span>
                  <span className="text-orange">
                    {priceFormatter.format(total)}
                  </span>
                </div>
              </div>

              {/* Submit Button desktop */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hidden lg:flex w-full mt-6 py-4 rounded-xl font-semibold text-lg text-blanc bg-orange hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Redirection vers le paiement…
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Payer {priceFormatter.format(total)}
                  </>
                )}
              </button>

              <p className="text-xs text-gris-chaud text-center mt-4">
                Paiement s&eacute;curis&eacute; par Stripe &middot; CB,
                Apple&nbsp;Pay, Google&nbsp;Pay
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
