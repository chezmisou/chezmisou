import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBox,
  Loading,
  Muted,
  QuantityStepper,
  Screen,
  styles as ui,
} from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { useCart } from "@/context/CartContext";
import { absoluteUrl } from "@/lib/api";
import { capitalize, formatDate, formatDateTime, formatPrice } from "@/lib/format";
import type { LacData } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

export default function LacScreen() {
  const { data, error, loading, refreshing, refresh } = useApi<LacData>("/api/mobile/lac");
  const { lac, lacMenuId, setLacQty } = useCart();

  if (loading) return <Loading />;

  const menu = data?.menu;
  // Un panier d'un ancien dimanche ne compte plus
  const items = menu && lacMenuId === menu.id ? lac : [];
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const qty = (dishId: string) => items.find((i) => i.lacDishId === dishId)?.quantity ?? 0;
  const minDelivery = data?.tiers.length ? Math.min(...data.tiers.map((t) => t.price)) : null;

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      footer={
        menu?.isOpen && count > 0 ? (
          <Button
            label={`Commander · ${count} plat${count > 1 ? "s" : ""} · ${formatPrice(subtotal)}`}
            icon="arrow-forward"
            onPress={() => router.push("/checkout/lac")}
          />
        ) : undefined
      }
    >
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}

      {!menu ? (
        <EmptyState
          icon="calendar-outline"
          title="Pas encore de menu"
          text="Le prochain menu du dimanche sera publié en début de semaine. Revenez bientôt !"
        />
      ) : (
        <>
          <View style={{ gap: space.xs }}>
            <Text style={ui.eyebrow}>Menu du dimanche</Text>
            <Text style={ui.title}>{capitalize(formatDate(menu.serviceDate))}</Text>
            {menu.isOpen ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: space.xs, marginTop: space.xs }}>
                <Ionicons name="time-outline" size={16} color={colors.orange} />
                <Text style={[ui.body, { color: colors.orange, fontFamily: fonts.sansMedium }]}>
                  Commandes jusqu’au {formatDateTime(menu.orderDeadline)}
                </Text>
              </View>
            ) : (
              <Badge label="Commandes fermées pour ce dimanche" tone="red" />
            )}
          </View>

          {menu.dishes.map((dish) => {
            const soldOut = dish.remaining === 0;
            const max = dish.remaining;
            return (
              <Card key={dish.id} style={{ padding: 0, overflow: "hidden" }}>
                {dish.photoUrl ? (
                  <Image
                    source={{ uri: absoluteUrl(dish.photoUrl) }}
                    style={{ width: "100%", aspectRatio: 16 / 10, backgroundColor: colors.orangeBg }}
                    contentFit="cover"
                    transition={150}
                    accessibilityLabel={dish.name}
                  />
                ) : null}
                <View style={{ padding: space.lg, gap: space.sm }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: space.md }}>
                    <Text style={[ui.sectionTitle, { flex: 1 }]}>{dish.name}</Text>
                    <Text style={[ui.strongOrange]}>{formatPrice(dish.price)}</Text>
                  </View>
                  {dish.description ? <Text style={ui.body}>{dish.description}</Text> : null}
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: space.xs }}>
                    {soldOut ? (
                      <Badge label="Épuisé" tone="red" />
                    ) : max != null && max <= 10 ? (
                      <Badge label={`Plus que ${max}`} tone="orange" />
                    ) : (
                      <View />
                    )}
                    {menu.isOpen && !soldOut ? (
                      <QuantityStepper
                        value={qty(dish.id)}
                        max={max}
                        onChange={(n) =>
                          setLacQty(menu.id, { lacDishId: dish.id, dishName: dish.name, price: dish.price }, n)
                        }
                      />
                    ) : null}
                  </View>
                </View>
              </Card>
            );
          })}

          <Card style={{ gap: space.md }}>
            <Text style={ui.sectionTitle}>Récupérer sa commande</Text>
            <View style={{ flexDirection: "row", gap: space.md }}>
              <Ionicons name="business-outline" size={22} color={colors.orange} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[ui.body, { fontFamily: fonts.sansBold }]}>À l’église · gratuit</Text>
                {data!.churches.length > 0 ? (
                  data!.churches.map((c) => (
                    <Muted key={c.id}>
                      {c.name}
                      {c.address ? ` · ${c.address}` : ""}
                    </Muted>
                  ))
                ) : (
                  <Muted>Retrait sur place, adresse communiquée par email.</Muted>
                )}
                {menu.info ? <Muted>{menu.info}</Muted> : null}
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: space.md }}>
              <Ionicons name="car-outline" size={22} color={colors.orange} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[ui.body, { fontFamily: fonts.sansBold }]}>
                  Livraison en Île-de-France{minDelivery != null ? ` · dès ${formatPrice(minDelivery)}` : ""}
                </Text>
                <Muted>Le prix dépend de la distance depuis Chelles.</Muted>
              </View>
            </View>
          </Card>
          <View style={{ height: radius.sm }} />
        </>
      )}
    </Screen>
  );
}
