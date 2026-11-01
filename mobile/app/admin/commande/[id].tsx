import { useState } from "react";
import { Linking, Pressable, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { deliveryLabel, statusTone } from "@/components/OrderCard";
import { Badge, Body, Card, Divider, ErrorBox, Loading, Muted, Row, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { ORDER_STATUS_LABELS, formatDateTime, formatPrice } from "@/lib/format";
import { customerName, type Order } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

const NEXT_STATUSES: Record<string, string[]> = {
  epicerie: ["paid", "preparing", "shipped", "delivered", "cancelled", "refunded"],
  lac: ["paid", "preparing", "delivered", "cancelled", "refunded"],
};

function ContactLink({ icon, label, url }: { icon: keyof typeof Ionicons.glyphMap; label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} style={{ flexDirection: "row", alignItems: "center", gap: space.sm, paddingVertical: 6 }} accessibilityRole="link">
      <Ionicons name={icon} size={18} color={colors.orange} />
      <Text style={[ui.body, { color: colors.orange }]}>{label}</Text>
    </Pressable>
  );
}

function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, refresh, setData } = useApi<Order>(`/api/mobile/admin/orders/${id}`);
  const [saving, setSaving] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <Screen><ErrorBox message={error || "Commande introuvable"} onRetry={refresh} /></Screen>;

  const o = data;
  const phone = o.customer?.phone;
  const mail = o.customer?.email || o.guestEmail;
  const cashDue = o.paymentProvider === "cash" && o.paymentStatus !== "paid";

  async function changeStatus(status: string) {
    setSaving(status);
    setActionError(null);
    try {
      await api(`/api/admin/commandes/${o.id}/status`, { method: "PATCH", body: { status } });
      setData({
        ...o,
        status,
        paymentStatus: o.paymentProvider === "cash" && (status === "paid" || status === "delivered") ? "paid" : o.paymentStatus,
      });
      refresh();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: o.orderNumber }} />
      <Screen>
        {actionError ? <ErrorBox message={actionError} /> : null}
        <Card style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
            <Badge label={ORDER_STATUS_LABELS[o.status] ?? o.status} tone={statusTone(o.status)} />
            <Badge label={o.type === "lac" ? "LAC" : "Épicerie"} />
            {cashDue ? <Badge label={`Espèces : ${formatPrice(o.total)} à encaisser`} tone="orange" /> : null}
            {o.paymentProvider === "cash" && !cashDue ? <Badge label="Espèces · encaissé" tone="green" /> : null}
          </View>
          <Muted>Passée le {formatDateTime(o.createdAt)}</Muted>
        </Card>

        <Card>
          <SectionTitle>Client</SectionTitle>
          <Body style={{ fontFamily: fonts.sansBold }}>{customerName(o)}</Body>
          {phone ? <ContactLink icon="call-outline" label={phone} url={`tel:${phone.replace(/\s/g, "")}`} /> : null}
          {phone ? <ContactLink icon="chatbubble-outline" label="Envoyer un SMS" url={`sms:${phone.replace(/\s/g, "")}`} /> : null}
          {mail ? <ContactLink icon="mail-outline" label={mail} url={`mailto:${mail}`} /> : null}
        </Card>

        <Card>
          <SectionTitle>{o.deliveryMethod === "pickup" ? "Retrait" : "Livraison"}</SectionTitle>
          <Body>{deliveryLabel(o)}</Body>
          {o.pickupLocation ? <Muted>{o.pickupLocation}</Muted> : null}
          {o.address ? (
            <>
              <Body style={{ marginTop: space.sm }}>
                {o.address.line1}
                {o.address.line2 ? `\n${o.address.line2}` : ""}
                {`\n${o.address.postalCode} ${o.address.city}`}
              </Body>
              <ContactLink
                icon="navigate-outline"
                label="Itinéraire"
                url={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${o.address.line1}, ${o.address.postalCode} ${o.address.city}`)}`}
              />
            </>
          ) : null}
          {o.notes ? (
            <View style={{ marginTop: space.sm, padding: space.md, backgroundColor: colors.orangeBg, borderRadius: radius.md }}>
              <Body>📝 {o.notes}</Body>
            </View>
          ) : null}
        </Card>

        <Card>
          <SectionTitle>Articles</SectionTitle>
          {o.items.map((it) => (
            <Row key={it.id} label={`${it.quantity} × ${it.name}`} value={formatPrice(it.unitPrice * it.quantity)} />
          ))}
          <Divider />
          <Row label="Sous-total" value={formatPrice(o.subtotal)} />
          <Row label="Livraison" value={o.shippingCost > 0 ? formatPrice(o.shippingCost) : "Gratuit"} />
          {o.discountAmount > 0 ? <Row label="Remise" value={`–${formatPrice(o.discountAmount)}`} /> : null}
          <Divider />
          <Row label="Total" value={formatPrice(o.total)} strong />
        </Card>

        <Card>
          <SectionTitle hint="Le client est prévenu par email.">Changer le statut</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
            {(NEXT_STATUSES[o.type] ?? []).map((s) => {
              const current = s === o.status;
              return (
                <Pressable
                  key={s}
                  onPress={() => !current && changeStatus(s)}
                  disabled={current || saving !== null}
                  accessibilityRole="button"
                  accessibilityState={{ selected: current, busy: saving === s }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: radius.md,
                    borderWidth: 1,
                    borderColor: current ? colors.orange : colors.border,
                    backgroundColor: current ? colors.orange : colors.blanc,
                    opacity: saving && saving !== s ? 0.5 : 1,
                  }}
                >
                  <Text style={{ fontFamily: fonts.sansMedium, color: current ? colors.blanc : colors.textBody }}>
                    {saving === s ? "…" : ORDER_STATUS_LABELS[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {cashDue ? (
            <Muted style={{ marginTop: space.sm }}>
              Passer en « Payée » ou « Livrée » marque aussi les espèces comme encaissées.
            </Muted>
          ) : null}
        </Card>
      </Screen>
    </>
  );
}

export default function AdminOrderScreen() {
  return (
    <AdminGuard>
      <OrderDetail />
    </AdminGuard>
  );
}
