import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { router, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { EmptyState, ErrorBox, Loading, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { useCart } from "@/context/CartContext";
import { absoluteUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Catalog } from "@/lib/types";
import { colors, fonts, radius, space } from "@/lib/theme";

function CartButton() {
  const { epicerieCount } = useCart();
  return (
    <Pressable
      onPress={() => router.push("/panier")}
      accessibilityLabel={`Panier, ${epicerieCount} article${epicerieCount > 1 ? "s" : ""}`}
      style={{ paddingHorizontal: space.lg }}
    >
      <Ionicons name="bag-handle-outline" size={24} color={colors.marronProfond} />
      {epicerieCount > 0 ? (
        <View
          style={{
            position: "absolute",
            right: 8,
            top: -4,
            backgroundColor: colors.orange,
            borderRadius: 9,
            minWidth: 18,
            height: 18,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: colors.blanc, fontSize: 11, fontFamily: fonts.sansBold }}>{epicerieCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function EpicerieScreen() {
  const { data, error, loading, refreshing, refresh } = useApi<Catalog>("/api/mobile/catalog");
  const { width } = useWindowDimensions();
  const cardWidth = (width - space.lg * 2 - space.md) / 2;

  return (
    <>
      <Tabs.Screen options={{ headerRight: () => <CartButton /> }} />
      {loading ? (
        <Loading />
      ) : (
        <Screen refreshing={refreshing} onRefresh={refresh}>
          {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
          {data ? (
            <Muted>
              Livraison en France métropolitaine : {formatPrice(data.shippingCost)}, offerte dès{" "}
              {formatPrice(data.freeThreshold)}.
            </Muted>
          ) : null}
          {data && data.products.length === 0 ? (
            <EmptyState icon="basket-outline" title="Bientôt en rayon" text="Les produits arrivent très vite." />
          ) : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.md }}>
            {data?.products.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/produit/${p.slug}`)}
                style={({ pressed }) => [
                  {
                    width: cardWidth,
                    backgroundColor: colors.blanc,
                    borderRadius: radius.lg,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                  pressed && { opacity: 0.85 },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${p.name}, à partir de ${formatPrice(p.fromPrice)}`}
              >
                <Image
                  source={p.imageUrl ? { uri: absoluteUrl(p.imageUrl) } : undefined}
                  style={{ width: "100%", aspectRatio: 1, backgroundColor: colors.orangeBg }}
                  contentFit="cover"
                  transition={150}
                />
                <View style={{ padding: space.md, gap: 2 }}>
                  <Text style={[ui.body, { fontFamily: fonts.sansBold, color: colors.marronProfond }]} numberOfLines={2}>
                    {p.name}
                  </Text>
                  <Text style={[ui.body, { color: colors.orange, fontFamily: fonts.sansBold }]}>
                    {p.fromPrice ? `dès ${formatPrice(p.fromPrice)}` : ""}
                  </Text>
                  {!p.inStock ? <Muted>Rupture de stock</Muted> : null}
                </View>
              </Pressable>
            ))}
          </View>
        </Screen>
      )}
    </>
  );
}
