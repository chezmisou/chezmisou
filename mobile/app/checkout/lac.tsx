import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Button,
  Card,
  ChoiceCard,
  Divider,
  EmptyState,
  ErrorBox,
  Eyebrow,
  Field,
  Loading,
  Muted,
  Row,
  Screen,
  SectionTitle,
  styles as ui,
} from "@/components/ui";
import { CustomerFields, validateCustomer, type CustomerForm } from "@/components/CustomerFields";
import { PromoCode } from "@/components/PromoCode";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { orderNumberFromUrl, payWithCard } from "@/lib/payment";
import { capitalize, formatDate, formatPrice } from "@/lib/format";
import type { AppliedPromo, LacData } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

interface Suggestion {
  label: string;
  line1: string;
  postalCode: string;
  city: string;
}

type Quote =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; fee: number; distanceKm: number }
  | { status: "error"; error: string };

export default function CheckoutLacScreen() {
  const { data, loading } = useApi<LacData>("/api/mobile/lac");
  const { lac, lacMenuId, lacSubtotal, clearLac } = useCart();
  const { email } = useAuth();

  // Église choisie (id), « pickup » sans église configurée, ou « delivery »
  const [choice, setChoice] = useState<string | null>(null);
  const [payment, setPayment] = useState<"cash" | "card">("cash");
  const [customer, setCustomer] = useState<CustomerForm>({ email: email ?? "", firstName: "", lastName: "", phone: "" });
  const [address, setAddress] = useState({ line1: "", line2: "", postalCode: "", city: "" });
  const [instructions, setInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const churches = data?.churches ?? [];
  const effectiveChoice = choice ?? (data && churches.length === 0 ? "pickup" : null);
  const isDelivery = effectiveChoice === "delivery";

  // --- Autocomplétion d'adresse (Île-de-France) ---
  const [suggest, setSuggest] = useState<{ q: string; results: Suggestion[] }>({ q: "", results: [] });
  const [picked, setPicked] = useState<string | null>(null);
  const query = address.line1.trim();
  const wantsSuggestions = isDelivery && query.length >= 4 && picked !== address.line1;

  useEffect(() => {
    if (!wantsSuggestions) return;
    let cancelled = false;
    const t = setTimeout(() => {
      api<{ results: Suggestion[] }>(`/api/lac/address-search?q=${encodeURIComponent(query)}`, { auth: false })
        .then((r) => !cancelled && setSuggest({ q: query, results: r.results ?? [] }))
        .catch(() => {});
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, wantsSuggestions]);

  const suggestions = wantsSuggestions && suggest.q === query ? suggest.results : [];

  // --- Prix de livraison selon la distance ---
  const qLine1 = address.line1.trim();
  const qPostal = address.postalCode.trim();
  const qCity = address.city.trim();
  const addressComplete = isDelivery && !!qLine1 && /^\d{5}$/.test(qPostal) && !!qCity;
  const quoteKey = `${qLine1}|${qPostal}|${qCity}`;
  const [quoteResult, setQuoteResult] = useState<{ key: string; quote: Quote } | null>(null);

  useEffect(() => {
    if (!addressComplete) return;
    let cancelled = false;
    const t = setTimeout(() => {
      api<{ ok: boolean; fee?: number; distanceKm?: number; error?: string }>("/api/lac/delivery-quote", {
        body: { line1: qLine1, postalCode: qPostal, city: qCity },
        auth: false,
      })
        .then((r) => {
          if (cancelled) return;
          setQuoteResult({
            key: quoteKey,
            quote:
              r.ok && r.fee != null && r.distanceKm != null
                ? { status: "ok", fee: r.fee, distanceKm: r.distanceKm }
                : { status: "error", error: r.error || "Impossible de calculer la livraison" },
          });
        })
        .catch((e) => {
          if (cancelled) return;
          setQuoteResult({
            key: quoteKey,
            quote: { status: "error", error: e instanceof Error ? e.message : "Impossible de calculer la livraison" },
          });
        });
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [addressComplete, quoteKey, qLine1, qPostal, qCity]);

  const quote: Quote = !addressComplete
    ? { status: "idle" }
    : quoteResult?.key === quoteKey
      ? quoteResult.quote
      : { status: "loading" };

  if (loading) return <Loading />;

  const menu = data?.menu;
  const items = menu && lacMenuId === menu.id ? lac : [];

  if (!menu || items.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="restaurant-outline"
          title="Votre panier LAC est vide"
          text="Choisissez vos plats dans le menu du dimanche."
          action={<Button label="Voir le menu" onPress={() => router.replace("/lac")} />}
        />
      </Screen>
    );
  }
  if (!menu.isOpen) {
    return (
      <Screen>
        <EmptyState
          icon="time-outline"
          title="Commandes fermées"
          text="Désolé, il n'est plus possible de commander pour ce dimanche. Le prochain menu arrive en début de semaine."
          action={<Button label="Retour au menu" onPress={() => router.replace("/lac")} />}
        />
      </Screen>
    );
  }

  const deliveryFee = isDelivery && quote.status === "ok" ? quote.fee : 0;
  const discount = promo?.discountAmount ?? 0;
  const total = lacSubtotal + deliveryFee - discount;
  const minDelivery = data!.tiers.length ? Math.min(...data!.tiers.map((t) => t.price)) : null;
  const selectedChurch = churches.find((c) => c.id === effectiveChoice);

  function validate(): boolean {
    const errs = validateCustomer(customer, true);
    if (!effectiveChoice) errs.choice = "Choisissez une église ou la livraison à domicile";
    if (isDelivery) {
      if (!address.line1.trim()) errs.line1 = "L'adresse est requise";
      if (!/^\d{5}$/.test(address.postalCode.trim())) errs.postalCode = "Code postal à 5 chiffres";
      if (!address.city.trim()) errs.city = "La ville est requise";
      if (!errs.line1 && !errs.postalCode && !errs.city) {
        if (quote.status === "error") errs.line1 = quote.error;
        else if (quote.status !== "ok") errs.line1 = "Patientez, le prix de livraison est en cours de calcul";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function submit() {
    if (!validate()) {
      setSubmitError("Vérifiez les champs en rouge.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await api<{ url: string; sessionId?: string }>("/api/checkout/lac", {
        body: {
          lacMenuId: menu!.id,
          items: items.map((i) => ({ lacDishId: i.lacDishId, quantity: i.quantity })),
          deliveryMethod: isDelivery ? "local_delivery" : "pickup",
          ...(!isDelivery && effectiveChoice && effectiveChoice !== "pickup" ? { pickupLocationId: effectiveChoice } : {}),
          customer: {
            email: customer.email.trim(),
            firstName: customer.firstName.trim(),
            lastName: customer.lastName.trim(),
            phone: customer.phone.trim(),
          },
          address: isDelivery ? address : null,
          instructions,
          notes,
          paymentMethod: payment,
          ...(promo ? { promoCodeId: promo.promoCodeId } : {}),
        },
        auth: false,
      });

      if (payment === "cash") {
        clearLac();
        router.replace({
          pathname: "/confirmation",
          params: { type: "lac", order: orderNumberFromUrl(r.url) ?? "", payment: "cash", total: total.toFixed(2) },
        });
        return;
      }

      const result = await payWithCard(r.url, r.sessionId);
      if (result.status === "paid") {
        clearLac();
        router.replace({
          pathname: "/confirmation",
          params: { type: "lac", order: result.orderNumber ?? "", payment: "card" },
        });
      } else {
        setSubmitError("Le paiement n'a pas été finalisé. Votre panier est conservé, vous pouvez réessayer.");
      }
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  function updateCustomer(field: keyof CustomerForm, v: string) {
    setCustomer((p) => ({ ...p, [field]: v }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }

  function updateAddress(field: keyof typeof address, v: string) {
    setAddress((p) => ({ ...p, [field]: v }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }

  function choose(c: string) {
    setChoice(c);
    setErrors((p) => ({ ...p, choice: "" }));
  }

  return (
    <Screen
      footer={
        <Button
          label={payment === "cash" ? `Commander · ${formatPrice(total)} en espèces` : `Payer ${formatPrice(total)}`}
          icon={payment === "cash" ? "cash-outline" : "lock-closed-outline"}
          onPress={submit}
          loading={submitting}
        />
      }
    >
      <Text style={[ui.body, { color: colors.orange, fontFamily: fonts.sansBold }]}>
        {capitalize(formatDate(menu.serviceDate))}
      </Text>
      {submitError ? <ErrorBox message={submitError} /> : null}

      {/* Mode de récupération */}
      <Card style={{ gap: space.sm }}>
        <SectionTitle
          hint={
            churches.length > 0
              ? "Récupérez votre commande dans votre église, ou faites-vous livrer."
              : "Récupérez votre commande sur place, ou faites-vous livrer."
          }
        >
          Mode de récupération
        </SectionTitle>

        {churches.length > 0 ? (
          <>
            <Eyebrow>Retrait à l’église · gratuit</Eyebrow>
            {churches.map((c) => (
              <ChoiceCard
                key={c.id}
                selected={effectiveChoice === c.id}
                onPress={() => choose(c.id)}
                icon="business-outline"
                title={c.name}
                subtitle={c.address || undefined}
              />
            ))}
          </>
        ) : (
          <ChoiceCard
            selected={effectiveChoice === "pickup"}
            onPress={() => choose("pickup")}
            icon="location-outline"
            title="Retrait sur place · gratuit"
            subtitle="L’adresse exacte vous sera communiquée par email après votre commande."
          />
        )}

        <View style={{ marginTop: space.sm }}>
          <Eyebrow>Ou ailleurs en Île-de-France</Eyebrow>
        </View>
        <ChoiceCard
          selected={isDelivery}
          onPress={() => choose("delivery")}
          icon="car-outline"
          title={`Livraison à domicile${minDelivery != null ? ` · dès ${formatPrice(minDelivery)}` : ""}`}
          subtitle="Le dimanche, partout en Île-de-France. Le prix dépend de la distance depuis Chelles."
        />
        {errors.choice ? <Text style={ui.errorText}>{errors.choice}</Text> : null}
      </Card>

      {/* Adresse de livraison */}
      {isDelivery ? (
        <Card>
          <SectionTitle>Adresse de livraison</SectionTitle>
          <Field
            label="Adresse *"
            value={address.line1}
            onChangeText={(t) => updateAddress("line1", t)}
            error={errors.line1}
            placeholder="Commencez à taper : 12 rue des Lilas, Montreuil"
            autoCorrect={false}
            textContentType="streetAddressLine1"
          />
          {suggestions.length > 0 ? (
            <View
              style={{
                marginTop: -space.sm,
                marginBottom: space.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {suggestions.map((s) => (
                <Pressable
                  key={s.label}
                  onPress={() => {
                    setPicked(s.line1);
                    setAddress((p) => ({ ...p, line1: s.line1, postalCode: s.postalCode, city: s.city }));
                    setErrors((p) => ({ ...p, line1: "", postalCode: "", city: "" }));
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: space.sm,
                    padding: space.md,
                    backgroundColor: pressed ? colors.orangeBg : colors.blanc,
                    borderBottomWidth: 1,
                    borderBottomColor: "#F4ECE2",
                  })}
                  accessibilityRole="button"
                >
                  <Ionicons name="location-outline" size={16} color={colors.grisChaud} />
                  <Text style={[ui.body, { flex: 1 }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Field
            label="Complément d’adresse"
            value={address.line2}
            onChangeText={(t) => updateAddress("line2", t)}
            placeholder="Bât. A, 3e étage"
          />
          <View style={{ flexDirection: "row", gap: space.md }}>
            <View style={{ flex: 2 }}>
              <Field
                label="Code postal *"
                value={address.postalCode}
                onChangeText={(t) => updateAddress("postalCode", t)}
                error={errors.postalCode}
                keyboardType="number-pad"
                maxLength={5}
              />
            </View>
            <View style={{ flex: 3 }}>
              <Field label="Ville *" value={address.city} onChangeText={(t) => updateAddress("city", t)} error={errors.city} />
            </View>
          </View>

          {quote.status !== "idle" ? (
            <View
              accessibilityLiveRegion="polite"
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: space.sm,
                padding: space.md,
                borderRadius: radius.md,
                marginBottom: space.md,
                backgroundColor: quote.status === "error" ? colors.dangerBg : colors.orangeBg,
              }}
            >
              {quote.status === "loading" ? (
                <>
                  <ActivityIndicator color={colors.orange} />
                  <Text style={ui.body}>Calcul du prix de livraison…</Text>
                </>
              ) : quote.status === "ok" ? (
                <>
                  <Ionicons name="car-outline" size={18} color={colors.orange} />
                  <Text style={[ui.body, { flex: 1 }]}>
                    {quote.distanceKm.toLocaleString("fr-FR")} km depuis Chelles : livraison{" "}
                    <Text style={{ fontFamily: fonts.sansBold }}>{formatPrice(quote.fee)}</Text>
                  </Text>
                </>
              ) : (
                <Text style={[ui.body, { color: colors.danger, flex: 1 }]}>{quote.error}</Text>
              )}
            </View>
          ) : null}

          <Field
            label="Instructions de livraison"
            value={instructions}
            onChangeText={setInstructions}
            multiline
            placeholder="Interphone, 3e étage gauche…"
          />
        </Card>
      ) : null}

      {/* Coordonnées */}
      <Card>
        <SectionTitle>Vos coordonnées</SectionTitle>
        <CustomerFields value={customer} onChange={updateCustomer} errors={errors} phoneRequired />
      </Card>

      {/* Paiement */}
      <Card style={{ gap: space.sm }}>
        <SectionTitle>Mode de paiement</SectionTitle>
        <ChoiceCard
          selected={payment === "cash"}
          onPress={() => setPayment("cash")}
          icon="cash-outline"
          title="En espèces"
          badge="Recommandé"
          subtitle={`Vous payez ${isDelivery ? "au livreur" : "au retrait"} dimanche. L’appoint est apprécié.`}
        />
        <ChoiceCard
          selected={payment === "card"}
          onPress={() => setPayment("card")}
          icon="card-outline"
          title="Carte bancaire"
          subtitle="Paiement en ligne sécurisé par Stripe, dès maintenant."
        />
      </Card>

      {/* Notes */}
      <Card>
        <SectionTitle>Notes pour Misou</SectionTitle>
        <Field label="Allergies, préférences…" value={notes} onChangeText={setNotes} multiline />
      </Card>

      {/* Récapitulatif */}
      <Card>
        <SectionTitle>Récapitulatif</SectionTitle>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs, marginBottom: space.sm }}>
          <Ionicons
            name={isDelivery ? "car-outline" : selectedChurch ? "business-outline" : "location-outline"}
            size={14}
            color={colors.grisChaud}
          />
          <Muted>
            {isDelivery
              ? "Livraison à domicile"
              : selectedChurch
                ? `Retrait : ${selectedChurch.name}`
                : effectiveChoice === "pickup"
                  ? "Retrait sur place"
                  : "Mode de récupération à choisir"}
          </Muted>
        </View>
        {items.map((i) => (
          <Row key={i.lacDishId} label={`${i.quantity} × ${i.dishName}`} value={formatPrice(i.price * i.quantity)} />
        ))}
        <Divider />
        <PromoCode
          type="lac"
          items={items.map((i) => ({ lacDishId: i.lacDishId, quantity: i.quantity, price: i.price }))}
          subtotal={lacSubtotal}
          email={customer.email}
          applied={promo}
          onChange={setPromo}
        />
        <Divider />
        <Row label="Sous-total" value={formatPrice(lacSubtotal)} />
        <Row
          label="Frais de livraison"
          value={isDelivery ? (quote.status === "ok" ? formatPrice(quote.fee) : "Selon l’adresse") : "Gratuit"}
        />
        {promo ? <Row label={`Remise (${promo.code})`} value={`–${formatPrice(discount)}`} /> : null}
        <Divider />
        <Row label="Total" value={formatPrice(total)} strong />
        <Muted style={{ marginTop: space.sm, textAlign: "center" }}>
          {payment === "cash" ? "Aucun paiement maintenant · réglez en espèces dimanche" : "Paiement sécurisé par Stripe"}
        </Muted>
      </Card>
    </Screen>
  );
}
