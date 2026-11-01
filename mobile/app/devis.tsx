import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, Card, EmptyState, ErrorBox, Field, Loading, Muted, Row, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { TraiteurData } from "@/lib/types";
import { colors, radius, space } from "@/lib/theme";

/** « 14/06/2026 » → Date (ou null). */
function parseFrDate(s: string): Date | null {
  const m = s.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), 12);
  return d.getMonth() === Number(m[2]) - 1 ? d : null;
}

export default function DevisScreen() {
  const { data, loading } = useApi<TraiteurData>("/api/mobile/traiteur");
  const { email } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: email ?? "",
    phone: "",
    eventDate: "",
    eventType: "",
    nbPeople: "",
    eventLocation: "",
    message: "",
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  if (loading) return <Loading />;

  if (sent !== null) {
    return (
      <Screen>
        <EmptyState
          icon="checkmark-circle-outline"
          title="Demande envoyée !"
          text={`Misou revient vers vous très vite avec un devis.${sent ? ` Référence : ${sent}.` : ""}`}
          action={<Button label="Retour" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  const nb = parseInt(form.nbPeople, 10);
  const estimate = (data?.dishes ?? [])
    .filter((d) => selected.includes(d.id))
    .reduce((sum, d) => {
      const f = d.formats.find((f) => nb >= f.minPeople && nb <= f.maxPeople);
      return sum + (f ? f.pricePerPerson * nb : 0);
    }, 0);

  function set(field: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [field]: v }));
    setErrors((p) => ({ ...p, [field]: "" }));
  }

  async function submit() {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Votre nom est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Email invalide";
    if (!form.phone.trim()) errs.phone = "Le téléphone est requis";
    const date = parseFrDate(form.eventDate);
    if (!date) errs.eventDate = "Format JJ/MM/AAAA";
    else if (date <= new Date()) errs.eventDate = "La date doit être dans le futur";
    if (isNaN(nb) || nb < 5 || nb > 50) errs.nbPeople = "Entre 5 et 50 personnes";
    if (selected.length === 0) errs.dishes = "Sélectionnez au moins un plat";
    setErrors(errs);
    if (Object.keys(errs).length) {
      setSubmitError("Vérifiez les champs en rouge.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await api<{ quoteNumber?: string }>("/api/quote-requests", {
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          eventDate: date!.toISOString(),
          eventType: form.eventType.trim() || undefined,
          nbPeople: nb,
          eventLocation: form.eventLocation.trim() || undefined,
          message: form.message.trim() || undefined,
          selectedDishes: selected.map((dishId) => ({ dishId })),
        },
      });
      setSent(r?.quoteNumber ?? "");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen footer={<Button label="Envoyer ma demande" icon="send-outline" onPress={submit} loading={submitting} />}>
      {submitError ? <ErrorBox message={submitError} /> : null}

      <Card>
        <SectionTitle hint="Touchez les plats qui vous font envie.">Vos plats</SectionTitle>
        <View style={{ gap: space.sm }}>
          {(data?.dishes ?? []).map((d) => {
            const on = selected.includes(d.id);
            return (
              <Pressable
                key={d.id}
                onPress={() => {
                  setSelected((p) => (on ? p.filter((x) => x !== d.id) : [...p, d.id]));
                  setErrors((p) => ({ ...p, dishes: "" }));
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: space.md,
                  padding: space.md,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: on ? colors.orange : "#EFE4D6",
                  backgroundColor: on ? "#FFF4EA" : colors.blanc,
                }}
              >
                <Ionicons name={on ? "checkbox" : "square-outline"} size={22} color={on ? colors.orange : colors.grisChaud} />
                <View style={{ flex: 1 }}>
                  <Text style={[ui.body, { fontWeight: "700", color: colors.marronProfond }]}>{d.name}</Text>
                  <Muted>{d.category}</Muted>
                </View>
              </Pressable>
            );
          })}
        </View>
        {errors.dishes ? <Text style={ui.errorText}>{errors.dishes}</Text> : null}
      </Card>

      <Card>
        <SectionTitle>Votre événement</SectionTitle>
        <View style={{ flexDirection: "row", gap: space.md }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Date *"
              value={form.eventDate}
              onChangeText={(t) => set("eventDate", t)}
              error={errors.eventDate}
              placeholder="JJ/MM/AAAA"
              keyboardType="numbers-and-punctuation"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label="Personnes *"
              value={form.nbPeople}
              onChangeText={(t) => set("nbPeople", t.replace(/\D/g, ""))}
              error={errors.nbPeople}
              placeholder="5 à 50"
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>
        <Field label="Type d’événement" value={form.eventType} onChangeText={(t) => set("eventType", t)} placeholder="Baptême, anniversaire…" />
        <Field label="Lieu" value={form.eventLocation} onChangeText={(t) => set("eventLocation", t)} placeholder="Ville ou adresse" />
        <Field label="Message" value={form.message} onChangeText={(t) => set("message", t)} multiline />
        {estimate > 0 ? (
          <Row label="Estimation indicative" value={formatPrice(estimate)} strong />
        ) : null}
      </Card>

      <Card>
        <SectionTitle>Vos coordonnées</SectionTitle>
        <Field label="Nom *" value={form.name} onChangeText={(t) => set("name", t)} error={errors.name} autoComplete="name" />
        <Field
          label="Email *"
          value={form.email}
          onChangeText={(t) => set("email", t)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Field label="Téléphone *" value={form.phone} onChangeText={(t) => set("phone", t)} error={errors.phone} keyboardType="phone-pad" />
      </Card>
      <Body style={{ color: colors.grisChaud, fontSize: 13 }}>
        Les prix sont indicatifs : Misou vous confirme le devis définitif.
      </Body>
    </Screen>
  );
}
