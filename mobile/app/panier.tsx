import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Button, Card, Divider, EmptyState, Muted, QuantityStepper, Row, Screen, styles as ui } from "@/components/ui";
import { useCart } from "@/context/CartContext";
import { useApi } from "@/lib/useApi";
import { absoluteUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Catalog } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

export default function CartScreen() {
  const { epicerie, epicerieSubtotal, setEpicerieQty } = useCart();
  const { data } = useApi<Catalog>("/api/mobile/catalog");
  const shippingCost = data ? (epicerieSubtotal >= data.freeThreshold ? 0 : data.shippingCost) : null;

  if (epicerie.length === 0) {
    return (
      <Screen>
        <EmptyState
          icon="bag-handle-outline"
          title="Votre panier est vide"
          text="Découvrez les épices, sauces et douceurs de Misou."
          action={<Button label="Voir l'épicerie" onPress={() => router.replace("/epicerie")} />}
        />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label="Passer commande" icon="arrow-forward" onPress={() => router.push("/checkout/epicerie")} />}>
      {epicerie.map((item) => (
        <Card key={item.variantId} style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
          <Image
            source={item.imageUrl ? { uri: absoluteUrl(item.imageUrl) } : undefined}
            style={{ width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.orangeBg }}
          />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[ui.body, { fontFamily: fonts.sansBold, color: colors.marronProfond }]}>{item.productName}</Text>
            <Muted>{item.variantName}</Muted>
            <Text style={[ui.body, { color: colors.orange, fontFamily: fonts.sansBold }]}>
              {formatPrice(item.price * item.quantity)}
            </Text>
          </View>
          <QuantityStepper compact value={item.quantity} onChange={(n) => setEpicerieQty(item.variantId, n)} max={item.stock} />
        </Card>
      ))}

      <Card>
        <Row label="Sous-total" value={formatPrice(epicerieSubtotal)} />
        <Row
          label="Livraison"
          value={shippingCost === null ? "…" : shippingCost === 0 ? "Offerte" : formatPrice(shippingCost)}
        />
        <Divider />
        <Row label="Total" value={formatPrice(epicerieSubtotal + (shippingCost ?? 0))} strong />
        {data && shippingCost !== 0 ? (
          <Muted style={{ marginTop: space.sm }}>
            Plus que {formatPrice(Math.max(0, data.freeThreshold - epicerieSubtotal))} pour la livraison offerte.
          </Muted>
        ) : null}
      </Card>
    </Screen>
  );
}
