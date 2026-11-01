"use client";

import { useState, useEffect, type FormEvent } from "react";
import { ArrowLeft, Banknote, Church, CreditCard, Loader2, Lock, MapPin, Truck } from "lucide-react";
import Link from "next/link";
import { useLacCart } from "@/lib/cart/LacCartContext";
import PromoCodeInput from "@/components/public/PromoCodeInput";
import type { LacChurch, LacDeliveryTier } from "@/lib/lac-delivery";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

/** Choix du client : id d'une église, « pickup » (aucune église configurée) ou « delivery ». */
type PickupChoice = string | null;

interface AddressSuggestion {
  label: string;
  line1: string;
  postalCode: string;
  city: string;
}

type DeliveryQuote =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; fee: number; distanceKm: number }
  | { status: "error"; error: string };

interface MenuInfo {
  serviceDate: string;
  orderDeadline: string;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  postalCode: string;
  city: string;
  instructions: string;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutLacPage() {
  const { items, currentMenuId, subtotal } = useLacCart();
  const [choice, setChoice] = useState<PickupChoice>(null);
  const deliveryMethod: "pickup" | "local_delivery" =
    choice === "delivery" ? "local_delivery" : "pickup";
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash");
  const [menuInfo, setMenuInfo] = useState<MenuInfo | null>(null);
  const [deadlinePassed, setDeadlinePassed] = useState(false);
  const [loading, setLoading] = useState(!!(currentMenuId && items.length > 0));

  const [form, setForm] = useState<FormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    line1: "",
    line2: "",
    postalCode: "",
    city: "",
    instructions: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    promoCodeId: string;
    discountAmount: number;
  } | null>(null);

  // Églises de retrait et grille de livraison (Paramètres Admin)
  const [churches, setChurches] = useState<LacChurch[]>([]);
  const [tiers, setTiers] = useState<LacDeliveryTier[]>([]);

  useEffect(() => {
    fetch("/api/lac/pickup-options")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const list: LacChurch[] = data.churches ?? [];
        setChurches(list);
        setTiers(data.tiers ?? []);
        // Sans église configurée : simple retrait sur place par défaut
        setChoice((prev) => prev ?? (list.length === 0 ? "pickup" : null));
      })
      .catch(() => setChoice((prev) => prev ?? "pickup"));
  }, []);

  // Autocomplétion de l'adresse.
  // Les résultats sont rangés avec la saisie qui les a produits : on n'affiche
  // que ceux de la saisie actuelle (pas de setState synchrone dans l'effet).
  const [suggest, setSuggest] = useState<{ q: string; results: AddressSuggestion[] }>({
    q: "",
    results: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  // Adresse choisie dans la liste : on ne repropose pas de suggestions pour elle
  const [pickedLine1, setPickedLine1] = useState<string | null>(null);

  const addressQuery = form.line1.trim();
  const wantsSuggestions =
    deliveryMethod === "local_delivery" &&
    addressQuery.length >= 4 &&
    pickedLine1 !== form.line1;

  useEffect(() => {
    if (!wantsSuggestions) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/lac/address-search?q=${encodeURIComponent(addressQuery)}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data) => {
          setSuggest({ q: addressQuery, results: data.results ?? [] });
          setShowSuggestions(true);
        })
        .catch(() => {});
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [addressQuery, wantsSuggestions]);

  const suggestions =
    wantsSuggestions && suggest.q === addressQuery ? suggest.results : [];

  function pickSuggestion(s: AddressSuggestion) {
    setPickedLine1(s.line1);
    setForm((prev) => ({ ...prev, line1: s.line1, postalCode: s.postalCode, city: s.city }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.line1;
      delete next.postalCode;
      delete next.city;
      return next;
    });
    setShowSuggestions(false);
  }

  // Prix de livraison calculé selon la distance, dès que l'adresse est complète.
  // Même principe : le résultat est lié à l'adresse qui l'a produit.
  const quoteLine1 = form.line1.trim();
  const quotePostalCode = form.postalCode.trim();
  const quoteCity = form.city.trim();
  const addressComplete =
    deliveryMethod === "local_delivery" &&
    !!quoteLine1 &&
    /^\d{5}$/.test(quotePostalCode) &&
    !!quoteCity;
  const quoteKey = `${quoteLine1}|${quotePostalCode}|${quoteCity}`;

  const [quoteResult, setQuoteResult] = useState<{
    key: string;
    quote: DeliveryQuote;
  } | null>(null);

  useEffect(() => {
    if (!addressComplete) return;
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch("/api/lac/delivery-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          line1: quoteLine1,
          postalCode: quotePostalCode,
          city: quoteCity,
        }),
        signal: ctrl.signal,
      })
        .then((r) => r.json())
        .then((data) => {
          setQuoteResult({
            key: quoteKey,
            quote: data?.ok
              ? { status: "ok", fee: data.fee, distanceKm: data.distanceKm }
              : {
                  status: "error",
                  error: data?.error || "Impossible de calculer la livraison",
                },
          });
        })
        .catch((err) => {
          if (err?.name !== "AbortError") {
            setQuoteResult({
              key: quoteKey,
              quote: { status: "error", error: "Impossible de calculer la livraison" },
            });
          }
        });
    }, 600);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [addressComplete, quoteKey, quoteLine1, quotePostalCode, quoteCity]);

  const quote: DeliveryQuote = !addressComplete
    ? { status: "idle" }
    : quoteResult?.key === quoteKey
      ? quoteResult.quote
      : { status: "loading" };

  const minDeliveryFee = tiers.length ? Math.min(...tiers.map((t) => t.price)) : null;
  const deliveryFee = quote.status === "ok" ? quote.fee : null;
  const shippingCost = deliveryMethod === "local_delivery" ? deliveryFee ?? 0 : 0;
  const discountAmount = appliedPromo?.discountAmount ?? 0;
  const total = subtotal + shippingCost - discountAmount;

  // Fetch menu info on mount to check deadline
  useEffect(() => {
    if (!currentMenuId || items.length === 0) return;
    let cancelled = false;
    fetch(`/api/lac/menu/${currentMenuId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setMenuInfo(data);
          setDeadlinePassed(new Date() > new Date(data.orderDeadline));
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentMenuId, items.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-orange" />
      </div>
    );
  }

  if (!currentMenuId || items.length === 0) {
    return (
      <section className="flex items-center justify-center min-h-[60vh] px-6 text-center">
        <div>
          <p className="font-sans text-lg text-text-body mb-6">
            Votre panier LAC est vide.
          </p>
          <Link
            href="/lac"
            className="inline-block px-8 py-4 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
          >
            Voir le menu du dimanche
          </Link>
        </div>
      </section>
    );
  }

  if (deadlinePassed) {
    return (
      <section className="flex items-center justify-center min-h-[60vh] px-6 text-center">
        <div>
          <p className="font-sans text-lg text-text-body mb-2">
            Désolé, les commandes sont fermées pour ce dimanche.
          </p>
          <p className="font-sans text-sm text-gris-chaud mb-6">
            Le prochain menu sera disponible en début de semaine.
          </p>
          <Link
            href="/lac"
            className="inline-block px-8 py-4 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
          >
            Retour au menu
          </Link>
        </div>
      </section>
    );
  }

  const serviceDateLabel = menuInfo
    ? new Date(menuInfo.serviceDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  function validate(): boolean {
    const errs: FormErrors = {};
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "L'email n'est pas valide";
    if (!form.firstName.trim()) errs.firstName = "Le prénom est requis";
    if (!form.lastName.trim()) errs.lastName = "Le nom est requis";
    if (!form.phone.trim()) errs.phone = "Le téléphone est requis";

    if (!choice) errs.choice = "Choisissez une église ou la livraison à domicile";

    if (deliveryMethod === "local_delivery") {
      if (!form.line1.trim()) errs.line1 = "L'adresse est requise";
      if (!form.postalCode.trim())
        errs.postalCode = "Le code postal est requis";
      if (!form.city.trim()) errs.city = "La ville est requise";
      if (!errs.line1 && !errs.postalCode && !errs.city) {
        if (quote.status === "error") errs.line1 = quote.error;
        else if (quote.status === "idle") errs.postalCode = "Code postal invalide (5 chiffres)";
        else if (quote.status !== "ok")
          errs.line1 = "Patientez, le prix de livraison est en cours de calcul";
      }
    }

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
        lacMenuId: currentMenuId,
        items: items.map((item) => ({
          lacDishId: item.lacDishId,
          quantity: item.quantity,
        })),
        deliveryMethod,
        ...(deliveryMethod === "pickup" && choice && choice !== "pickup"
          ? { pickupLocationId: choice }
          : {}),
        customer: {
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
        },
        address:
          deliveryMethod === "local_delivery"
            ? {
                line1: form.line1,
                line2: form.line2,
                postalCode: form.postalCode,
                city: form.city,
              }
            : null,
        instructions: form.instructions,
        notes: form.notes,
        paymentMethod,
        ...(appliedPromo ? { promoCodeId: appliedPromo.promoCodeId } : {}),
      };

      const res = await fetch("/api/checkout/lac", {
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
        href="/lac"
        className="inline-flex items-center gap-1 text-sm text-text-body hover:text-orange transition-colors mb-6 font-sans"
      >
        <ArrowLeft size={16} />
        Retour au menu
      </Link>

      <h1 className="font-serif text-3xl md:text-4xl text-marron-profond mb-8">
        Finaliser votre commande LAC
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
            {/* Delivery Method */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-1">
                Mode de récupération
              </h2>
              <p className="font-sans text-sm text-text-body mb-5">
                {churches.length > 0
                  ? "Récupérez votre commande dans votre église, ou faites-vous livrer."
                  : "Récupérez votre commande sur place, ou faites-vous livrer."}
              </p>

              <div className="space-y-3" role="radiogroup" aria-label="Mode de récupération">
                {churches.length > 0 ? (
                  <>
                    <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gris-chaud">
                      Retrait à l&rsquo;église · gratuit
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {churches.map((church) => {
                        const selected = choice === church.id;
                        return (
                          <button
                            key={church.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setChoice(church.id);
                              setErrors((prev) => ({ ...prev, choice: "" }));
                            }}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              selected
                                ? "border-orange bg-orange/5"
                                : "border-marron-profond/10 hover:border-marron-profond/30"
                            }`}
                          >
                            <Church
                              size={22}
                              className={`shrink-0 mt-0.5 ${selected ? "text-orange" : "text-gris-chaud"}`}
                            />
                            <span className="min-w-0">
                              <span className="block font-sans font-semibold text-marron-profond">
                                {church.name}
                              </span>
                              {church.address && (
                                <span className="block font-sans text-xs text-text-body mt-0.5">
                                  {church.address}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={choice === "pickup"}
                    onClick={() => setChoice("pickup")}
                    className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      choice === "pickup"
                        ? "border-orange bg-orange/5"
                        : "border-marron-profond/10 hover:border-marron-profond/30"
                    }`}
                  >
                    <MapPin
                      size={22}
                      className={`shrink-0 mt-0.5 ${choice === "pickup" ? "text-orange" : "text-gris-chaud"}`}
                    />
                    <span>
                      <span className="block font-sans font-semibold text-marron-profond">
                        Retrait sur place · gratuit
                      </span>
                      <span className="block font-sans text-xs text-text-body mt-0.5">
                        L&rsquo;adresse exacte vous sera communiquée par email après votre commande.
                      </span>
                    </span>
                  </button>
                )}

                <p className="font-sans text-xs font-semibold uppercase tracking-widest text-gris-chaud pt-2">
                  Ou ailleurs en Île-de-France
                </p>
                <button
                  type="button"
                  role="radio"
                  aria-checked={choice === "delivery"}
                  onClick={() => {
                    setChoice("delivery");
                    setErrors((prev) => ({ ...prev, choice: "" }));
                  }}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    choice === "delivery"
                      ? "border-orange bg-orange/5"
                      : "border-marron-profond/10 hover:border-marron-profond/30"
                  }`}
                >
                  <Truck
                    size={22}
                    className={`shrink-0 mt-0.5 ${choice === "delivery" ? "text-orange" : "text-gris-chaud"}`}
                  />
                  <span>
                    <span className="block font-sans font-semibold text-marron-profond">
                      Livraison à domicile
                      {minDeliveryFee != null && (
                        <span className="font-normal text-text-body">
                          {" "}· dès {priceFormatter.format(minDeliveryFee)}
                        </span>
                      )}
                    </span>
                    <span className="block font-sans text-xs text-text-body mt-0.5">
                      Le dimanche, partout en Île-de-France. Le prix dépend de la distance depuis Chelles
                      et s&rsquo;affiche dès que vous entrez votre adresse.
                    </span>
                  </span>
                </button>
              </div>
              {errors.choice && (
                <p className="text-red-500 text-xs mt-3">{errors.choice}</p>
              )}
            </div>

            {/* Customer Info */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Vos coordonnées
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-body mb-1 font-sans">
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
                    <label className="block text-sm font-medium text-text-body mb-1 font-sans">
                      Prénom *
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
                    <label className="block text-sm font-medium text-text-body mb-1 font-sans">
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
                  <label className="block text-sm font-medium text-text-body mb-1 font-sans">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={inputClass("phone")}
                    placeholder="+33 6 12 34 56 78"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address (only for delivery) */}
            {deliveryMethod === "local_delivery" && (
              <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
                <h2 className="font-serif text-xl text-marron-profond mb-5">
                  Adresse de livraison
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-text-body mb-1 font-sans">
                      Adresse *
                    </label>
                    <input
                      type="text"
                      value={form.line1}
                      onChange={(e) => updateField("line1", e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      className={inputClass("line1")}
                      placeholder="Commencez à taper : 12 rue des Lilas, Montreuil"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={showSuggestions && suggestions.length > 0}
                      aria-controls="lac-address-suggestions"
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul
                        id="lac-address-suggestions"
                        role="listbox"
                        className="absolute z-20 left-0 right-0 mt-1 bg-blanc rounded-xl border border-marron-profond/15 shadow-lg overflow-hidden"
                      >
                        {suggestions.map((s) => (
                          <li key={s.label} role="option" aria-selected={false}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => pickSuggestion(s)}
                              className="w-full text-left px-4 py-2.5 text-sm font-sans text-marron-profond hover:bg-orange/5 flex items-center gap-2"
                            >
                              <MapPin size={14} className="text-gris-chaud shrink-0" />
                              {s.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.line1 && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.line1}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1 font-sans">
                      Compl&eacute;ment d&rsquo;adresse
                    </label>
                    <input
                      type="text"
                      value={form.line2}
                      onChange={(e) => updateField("line2", e.target.value)}
                      className={inputClass("line2")}
                      placeholder="Bât. A, 3e étage"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-body mb-1 font-sans">
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
                      <label className="block text-sm font-medium text-text-body mb-1 font-sans">
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
                  {quote.status !== "idle" && (
                    <div
                      aria-live="polite"
                      className={`flex items-center gap-2 p-3 rounded-xl text-sm font-sans ${
                        quote.status === "error"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-orange/5 text-marron-profond border border-orange/20"
                      }`}
                    >
                      {quote.status === "loading" && (
                        <>
                          <Loader2 size={16} className="animate-spin text-orange" />
                          Calcul du prix de livraison…
                        </>
                      )}
                      {quote.status === "ok" && (
                        <>
                          <Truck size={16} className="text-orange shrink-0" />
                          <span>
                            {quote.distanceKm.toLocaleString("fr-FR")} km depuis Chelles :
                            livraison <strong>{priceFormatter.format(quote.fee)}</strong>
                          </span>
                        </>
                      )}
                      {quote.status === "error" && quote.error}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-text-body mb-1 font-sans">
                      Instructions de livraison
                    </label>
                    <textarea
                      value={form.instructions}
                      onChange={(e) =>
                        updateField("instructions", e.target.value)
                      }
                      className={inputClass("instructions")}
                      rows={2}
                      placeholder="Interphone, 3e étage gauche…"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5">
              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Mode de paiement
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  aria-pressed={paymentMethod === "cash"}
                  className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === "cash"
                      ? "border-orange bg-orange/5"
                      : "border-marron-profond/10 hover:border-marron-profond/30"
                  }`}
                >
                  <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-green-600 text-blanc text-[11px] font-semibold font-sans">
                    Recommandé
                  </span>
                  <Banknote
                    size={28}
                    className={
                      paymentMethod === "cash" ? "text-orange" : "text-gris-chaud"
                    }
                  />
                  <span className="font-sans font-semibold text-marron-profond">
                    En espèces
                  </span>
                  <span className="font-sans text-xs text-text-body">
                    Vous payez {deliveryMethod === "pickup" ? "au retrait" : "au livreur"} dimanche. L&rsquo;appoint est apprécié.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  aria-pressed={paymentMethod === "card"}
                  className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all text-center ${
                    paymentMethod === "card"
                      ? "border-orange bg-orange/5"
                      : "border-marron-profond/10 hover:border-marron-profond/30"
                  }`}
                >
                  <CreditCard
                    size={28}
                    className={
                      paymentMethod === "card" ? "text-orange" : "text-gris-chaud"
                    }
                  />
                  <span className="font-sans font-semibold text-marron-profond">
                    Carte bancaire
                  </span>
                  <span className="font-sans text-xs text-text-body">
                    Paiement en ligne sécurisé par Stripe, dès maintenant.
                  </span>
                </button>
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
                placeholder="Allergies, préférences…"
              />
            </div>

            {/* Submit Button mobile */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full lg:hidden py-4 rounded-xl font-semibold text-lg text-blanc bg-orange hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {paymentMethod === "cash" ? "Validation de la commande…" : "Redirection vers le paiement…"}
                </>
              ) : (
                <>
                  {paymentMethod === "cash" ? <Banknote size={18} /> : <Lock size={18} />}
                  {paymentMethod === "cash"
                    ? `Commander · ${priceFormatter.format(total)} en espèces`
                    : `Payer ${priceFormatter.format(total)}`}
                </>
              )}
            </button>
          </div>

          {/* Right Column — Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-blanc rounded-2xl p-6 lg:sticky lg:top-24 shadow-sm border border-marron-profond/5">
              {/* Service date */}
              <p className="text-sm font-sans text-orange font-semibold capitalize mb-4">
                {serviceDateLabel}
              </p>

              {/* Delivery method summary */}
              <div className="flex items-center gap-2 mb-4 text-sm font-sans text-text-body">
                {choice === "delivery" ? (
                  <>
                    <Truck size={14} className="text-gris-chaud shrink-0" />
                    Livraison à domicile
                  </>
                ) : choice && choice !== "pickup" ? (
                  <>
                    <Church size={14} className="text-gris-chaud shrink-0" />
                    Retrait : {churches.find((c) => c.id === choice)?.name}
                  </>
                ) : choice === "pickup" ? (
                  <>
                    <MapPin size={14} className="text-gris-chaud shrink-0" />
                    Retrait sur place
                  </>
                ) : (
                  <span className="text-gris-chaud">Mode de récupération à choisir</span>
                )}
              </div>

              <h2 className="font-serif text-xl text-marron-profond mb-5">
                Récapitulatif
              </h2>

              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start text-sm font-sans"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-marron-profond truncate">
                        {item.dishName}
                      </p>
                      <p className="text-xs text-gris-chaud">
                        × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-text-body ml-3 whitespace-nowrap">
                      {priceFormatter.format(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo code */}
              <div className="mb-5">
                <PromoCodeInput
                  type="lac"
                  items={items.map((item) => ({
                    lacDishId: item.lacDishId,
                    quantity: item.quantity,
                    price: item.price,
                  }))}
                  subtotal={subtotal}
                  customerEmail={form.email || undefined}
                  onApply={(result) => setAppliedPromo(result)}
                  onRemove={() => setAppliedPromo(null)}
                />
              </div>

              <div className="border-t border-marron-profond/10 pt-4 space-y-2 font-sans">
                <div className="flex justify-between text-sm text-text-body">
                  <span>Sous-total</span>
                  <span>{priceFormatter.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-text-body">
                  <span>Frais de livraison</span>
                  <span>
                    {deliveryMethod === "local_delivery" && deliveryFee == null
                      ? "Selon l’adresse"
                      : shippingCost === 0
                        ? "Gratuit"
                        : priceFormatter.format(shippingCost)}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Remise ({appliedPromo.code})</span>
                    <span>–{priceFormatter.format(appliedPromo.discountAmount)}</span>
                  </div>
                )}
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
                className="hidden lg:flex w-full mt-6 py-4 rounded-xl font-semibold text-lg text-blanc bg-orange hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed items-center justify-center gap-2 font-sans"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {paymentMethod === "cash" ? "Validation de la commande…" : "Redirection vers le paiement…"}
                  </>
                ) : (
                  <>
                    {paymentMethod === "cash" ? <Banknote size={18} /> : <Lock size={18} />}
                    {paymentMethod === "cash"
                      ? `Commander · ${priceFormatter.format(total)} en espèces`
                      : `Payer ${priceFormatter.format(total)}`}
                  </>
                )}
              </button>

              <p className="text-xs text-gris-chaud text-center mt-4 font-sans">
                {paymentMethod === "cash"
                  ? "Aucun paiement maintenant · réglez en espèces dimanche"
                  : "Paiement sécurisé par Stripe"}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
