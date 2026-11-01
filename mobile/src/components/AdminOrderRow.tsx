import { Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Badge, Card, Muted, styles as ui } from "./ui";
import { deliveryLabel, statusTone } from "./OrderCard";
import { ORDER_STATUS_LABELS, formatPrice, formatShortDate } from "@/lib/format";
import { customerName, type Order } from "@/lib/types";
import { colors, fonts, space } from "@/lib/theme";

/** Ligne de commande dans les listes admin : ouvre le détail. */
export function AdminOrderRow({ order, showItems }: { order: Order; showItems?: boolean }) {
  const cashDue = order.paymentProvider === "cash" && order.paymentStatus !== "paid";
  return (
    <Card onPress={() => router.push(`/admin/commande/${order.id}`)} style={{ gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: space.sm }}>
        <Text style={[ui.body, { fontFamily: fonts.sansBold, color: colors.marronProfond, flex: 1 }]} numberOfLines={1}>
          {customerName(order)}
        </Text>
        <Text style={ui.strongOrange}>{formatPrice(order.total)}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.grisChaud} />
      </View>
      <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap", alignItems: "center" }}>
        <Badge label={ORDER_STATUS_LABELS[order.status] ?? order.status} tone={statusTone(order.status)} />
        <Badge label={order.type === "lac" ? "LAC" : "Épicerie"} />
        {cashDue ? <Badge label="Espèces à encaisser" tone="orange" /> : null}
      </View>
      {showItems ? (
        <Text style={ui.body}>{order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</Text>
      ) : null}
      <Muted>
        {order.orderNumber} · {formatShortDate(order.createdAt)} · {deliveryLabel(order)}
      </Muted>
    </Card>
  );
}
