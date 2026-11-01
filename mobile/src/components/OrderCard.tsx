import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge, Divider, Muted, Row, styles as ui } from "./ui";
import { ORDER_STATUS_LABELS, formatPrice, formatShortDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { colors, fonts, space } from "@/lib/theme";

export function statusTone(status: string): "neutral" | "orange" | "green" | "red" {
  if (status === "delivered" || status === "shipped") return "green";
  if (status === "cancelled" || status === "refunded") return "red";
  if (status === "new" || status === "paid" || status === "preparing") return "orange";
  return "neutral";
}

export function deliveryLabel(o: Order): string {
  if (o.deliveryMethod === "pickup") return o.pickupLocation ? `Retrait : ${o.pickupLocation.split(" — ")[0]}` : "Retrait sur place";
  if (o.deliveryMethod === "local_delivery")
    return `Livraison à domicile${o.deliveryDistanceKm != null ? ` (${o.deliveryDistanceKm.toLocaleString("fr-FR")} km)` : ""}`;
  return "Livraison";
}

/** Commande du client, dépliable pour voir le détail. */
export function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={[ui.card, { gap: space.sm }]}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={[ui.body, { fontFamily: fonts.sansBold, color: colors.marronProfond }]}>
          {order.type === "lac" ? "LAC" : "Épicerie"} · {order.orderNumber}
        </Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={18} color={colors.grisChaud} />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Badge label={ORDER_STATUS_LABELS[order.status] ?? order.status} tone={statusTone(order.status)} />
        <Text style={ui.strongOrange}>{formatPrice(order.total)}</Text>
      </View>
      <Muted>
        {formatShortDate(order.createdAt)} · {deliveryLabel(order)}
      </Muted>
      {open ? (
        <View>
          <Divider />
          {order.items.map((it) => (
            <Row key={it.id} label={`${it.quantity} × ${it.name}`} value={formatPrice(it.unitPrice * it.quantity)} />
          ))}
          {order.shippingCost > 0 ? <Row label="Livraison" value={formatPrice(order.shippingCost)} /> : null}
          {order.discountAmount > 0 ? <Row label="Remise" value={`–${formatPrice(order.discountAmount)}`} /> : null}
          {order.paymentProvider === "cash" && order.paymentStatus !== "paid" ? (
            <Muted style={{ marginTop: space.sm }}>À régler en espèces : {formatPrice(order.total)}</Muted>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}
