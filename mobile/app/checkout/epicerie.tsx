import { useState } from "react";
import { router } from "expo-router";
import { Button, Card, Divider, ErrorBox, Field, Muted, Row, Screen, SectionTitle } from "@/components/ui";
import { CustomerFields, validateCustomer, type CustomerForm } from "@/components/CustomerFields";
import { PromoCode } from "@/components/PromoCode";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { payWithCard } from "@/lib/payment";
import { formatPrice } from "@/lib/format";
import type { AppliedPromo, Catalog } from "@/lib/types";

export default function CheckoutEpicerieScreen() {
  const { epicerie, epicerieSubtotal, clearEpicerie } = useCart();
  const { email } = useAuth();
  const { data: catalog } = useApi<Catalog>("/api/mobile/catalog");

  const [customer, setCustomer] = useState<CustomerForm>({
    email: email ?? "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [address, setAddress] = useState({ line1: "", line2: "", postalCode: "", city: "" });
  const [notes, setNotes] = useState("");
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shipping = catalog ? (epicerieSubtotal >= catalog.freeThreshold ? 0 : catalog.shippingCost) : 0;
  const discount = promo?.discountAmount ?? 0;
  const total = epicerieSubtotal + shipping - discount;

  function validate() {
    const errs = validateCustomer(customer, false);
    if (!address.line1.trim()) errs.line1 = "L'adresse est requise";
    if (!/^\d{5}$/.test(address.postalCode.trim())) errs.postalCode = "Code postal à 5 chiffres";
    if (!address.city.trim()) errs.city = "La ville est requise";
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
      const r = await api<{ url: string; sessionId?: string }>("/api/checkout/epicerie", {
        body: {
          items: epicerie.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          customer: {
            email: customer.email.trim(),
            firstName: customer.firstName.trim(),
            lastName: customer.lastName.trim(),
            phone: customer.phone.trim() || undefined,
          },
          address: { ...address, country: "FR" },
          notes: notes || undefined,
          ...(promo ? { promoCodeId: promo.promoCodeId } : {}),
        },
        auth: false,
      });
      const result = await payWithCard(r.url, r.sessionId);
      if (result.status === "paid") {
        clearEpicerie();
        router.replace({
          pathname: "/confirmation",
          params: { type: "epicerie", order: result.orderNumber ?? "", payment: "card" },
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

  return (
    <Screen
      footer={
        <Button
          label={`Payer ${formatPrice(total)}`}
          icon="lock-closed-outline"
          onPress={submit}
          loading={submitting}
          disabled={epicerie.length === 0}
        />
      }
    >
      {submitError ? <ErrorBox message={submitError} /> : null}

      <Card>
        <SectionTitle>Vos coordonnées</SectionTitle>
        <CustomerFields value={customer} onChange={updateCustomer} errors={errors} phoneRequired={false} />
      </Card>

      <Card>
        <SectionTitle hint="France métropolitaine">Adresse de livraison</SectionTitle>
        <Field
          label="Adresse *"
          value={address.line1}
          onChangeText={(t) => updateAddress("line1", t)}
          error={errors.line1}
          autoComplete="street-address"
          textContentType="streetAddressLine1"
          placeholder="12 rue des Lilas"
        />
        <Field
          label="Complément"
          value={address.line2}
          onChangeText={(t) => updateAddress("line2", t)}
          placeholder="Bât. A, 3e étage"
        />
        <Field
          label="Code postal *"
          value={address.postalCode}
          onChangeText={(t) => updateAddress("postalCode", t)}
          error={errors.postalCode}
          keyboardType="number-pad"
          maxLength={5}
          textContentType="postalCode"
        />
        <Field
          label="Ville *"
          value={address.city}
          onChangeText={(t) => updateAddress("city", t)}
          error={errors.city}
          textContentType="addressCity"
        />
        <Field label="Note pour Misou" value={notes} onChangeText={setNotes} multiline placeholder="Message, précision…" />
      </Card>

      <Card>
        <SectionTitle>Récapitulatif</SectionTitle>
        {epicerie.map((i) => (
          <Row key={i.variantId} label={`${i.quantity} × ${i.productName} (${i.variantName})`} value={formatPrice(i.price * i.quantity)} />
        ))}
        <Divider />
        <PromoCode
          type="epicerie"
          items={epicerie.map((i) => ({ variantId: i.variantId, productId: i.productId, quantity: i.quantity, price: i.price }))}
          subtotal={epicerieSubtotal}
          email={customer.email}
          applied={promo}
          onChange={setPromo}
        />
        <Divider />
        <Row label="Sous-total" value={formatPrice(epicerieSubtotal)} />
        <Row label="Livraison" value={shipping === 0 ? "Offerte" : formatPrice(shipping)} />
        {promo ? <Row label={`Remise (${promo.code})`} value={`–${formatPrice(discount)}`} /> : null}
        <Divider />
        <Row label="Total" value={formatPrice(total)} strong />
      </Card>
      <Muted>Le paiement s’ouvre dans une page sécurisée Stripe, puis vous revenez dans l’app.</Muted>
    </Screen>
  );
}
