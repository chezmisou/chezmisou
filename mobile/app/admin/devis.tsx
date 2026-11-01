import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { Badge, Body, Button, Card, Divider, EmptyState, ErrorBox, Field, Loading, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { QUOTE_STATUS_LABELS, capitalize, formatDate, formatPrice, formatShortDate } from "@/lib/format";
import { colors, fonts, radius, space } from "@/lib/theme";

interface Quote {
  id: string;
  quoteNumber: string;
  status: string;
  name: string;
  email: string;
  phone: string | null;
  eventDate: string;
  eventType: string | null;
  nbPeople: number;
  eventLocation: string | null;
  selectedDishes: { dishName: string; estimatedTotal: number | null }[] | null;
  message: string | null;
  adminNotes: string | null;
  createdAt: string;
}

const tone = (s: string) => (s === "new" ? "orange" : s === "accepted" ? "green" : s === "refused" ? "red" : "neutral") as
  | "orange"
  | "green"
  | "red"
  | "neutral";

function QuoteCard({ quote, onChanged }: { quote: Quote; onChanged: (q: Quote) => void }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(quote.adminNotes ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dishes = Array.isArray(quote.selectedDishes) ? quote.selectedDishes : [];
  const estimate = dishes.reduce((s, d) => s + (d.estimatedTotal ?? 0), 0);

  async function setStatus(status: string) {
    setBusy(status);
    setError(null);
    try {
      await api(`/api/admin/devis/${quote.id}/status`, { method: "PATCH", body: { status } });
      onChanged({ ...quote, status });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  async function saveNotes() {
    setBusy("notes");
    setError(null);
    try {
      await api(`/api/admin/devis/${quote.id}/notes`, { method: "PATCH", body: { adminNotes: notes } });
      onChanged({ ...quote, adminNotes: notes });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card style={{ gap: 6 }}>
      <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
          <Text style={[ui.body, { flex: 1, fontFamily: fonts.sansBold, color: colors.marronProfond }]}>{quote.name}</Text>
          <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.grisChaud} />
        </View>
        <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
          <Badge label={QUOTE_STATUS_LABELS[quote.status] ?? quote.status} tone={tone(quote.status)} />
          <Badge label={`${quote.nbPeople} pers.`} />
        </View>
        <Muted>
          {capitalize(formatDate(quote.eventDate))}
          {quote.eventType ? ` · ${quote.eventType}` : ""} · reçu le {formatShortDate(quote.createdAt)}
        </Muted>
      </Pressable>

      {open ? (
        <View style={{ gap: space.sm }}>
          <Divider />
          {quote.phone ? (
            <Pressable onPress={() => Linking.openURL(`tel:${quote.phone!.replace(/\s/g, "")}`)} style={{ flexDirection: "row", gap: space.sm }}>
              <Ionicons name="call-outline" size={18} color={colors.orange} />
              <Text style={[ui.body, { color: colors.orange }]}>{quote.phone}</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => Linking.openURL(`mailto:${quote.email}?subject=${encodeURIComponent(`Votre devis ${quote.quoteNumber} — Chez Misou`)}`)} style={{ flexDirection: "row", gap: space.sm }}>
            <Ionicons name="mail-outline" size={18} color={colors.orange} />
            <Text style={[ui.body, { color: colors.orange }]}>{quote.email}</Text>
          </Pressable>
          {quote.eventLocation ? <Body>📍 {quote.eventLocation}</Body> : null}
          {dishes.length > 0 ? (
            <View>
              <Text style={ui.label}>Plats souhaités</Text>
              {dishes.map((d, i) => (
                <Body key={i}>
                  • {d.dishName}
                  {d.estimatedTotal ? ` (≈ ${formatPrice(d.estimatedTotal)})` : ""}
                </Body>
              ))}
              {estimate > 0 ? <Muted>Estimation totale : {formatPrice(estimate)}</Muted> : null}
            </View>
          ) : null}
          {quote.message ? (
            <View style={{ backgroundColor: colors.orangeBg, padding: space.md, borderRadius: radius.md }}>
              <Body>{quote.message}</Body>
            </View>
          ) : null}

          <Text style={ui.label}>Statut</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {Object.entries(QUOTE_STATUS_LABELS).map(([value, label]) => {
              const current = value === quote.status;
              return (
                <Pressable
                  key={value}
                  onPress={() => !current && setStatus(value)}
                  disabled={current || busy !== null}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: current ? colors.orange : colors.border,
                    backgroundColor: current ? colors.orange : colors.blanc,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: current }}
                >
                  <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: current ? colors.blanc : colors.textBody }}>
                    {busy === value ? "…" : label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Field label="Notes internes" value={notes} onChangeText={setNotes} multiline />
          <Button
            label="Enregistrer les notes"
            variant="secondary"
            onPress={saveNotes}
            loading={busy === "notes"}
            disabled={notes === (quote.adminNotes ?? "")}
          />
          {error ? <ErrorBox message={error} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

function Quotes() {
  const { data, error, loading, refreshing, refresh, setData } = useApi<{ quotes: Quote[] }>("/api/mobile/admin/devis");
  if (loading) return <Loading />;
  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data && data.quotes.length === 0 ? <EmptyState icon="document-text-outline" title="Aucune demande de devis" /> : null}
      {data?.quotes.map((q) => (
        <QuoteCard
          key={q.id}
          quote={q}
          onChanged={(nq) => setData({ quotes: data.quotes.map((x) => (x.id === nq.id ? nq : x)) })}
        />
      ))}
    </Screen>
  );
}

export default function AdminDevisScreen() {
  return (
    <AdminGuard>
      <Quotes />
    </AdminGuard>
  );
}
