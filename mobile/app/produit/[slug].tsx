import { useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Body, Button, ChoiceCard, ErrorBox, Loading, Muted, QuantityStepper, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { useCart } from "@/context/CartContext";
import { absoluteUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { ProductDetail } from "@/lib/types";
import { colors, space } from "@/lib/theme";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading, refresh } = useApi<ProductDetail>(`/api/mobile/catalog/${encodeURIComponent(slug)}`);
  const { addEpicerie } = useCart();
  const { width } = useWindowDimensions();
  const [variantId, setVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) return <Loading />;
  if (error || !data) {
    return (
      <Screen>
        <ErrorBox message={error || "Produit introuvable"} onRetry={refresh} />
      </Screen>
    );
  }

  const variant =
    data.variants.find((v) => v.id === variantId) ?? data.variants.find((v) => v.stock > 0) ?? data.variants[0];
  const outOfStock = !variant || variant.stock <= 0;

  function add() {
    if (!variant) return;
    addEpicerie(
      {
        variantId: variant.id,
        productId: data!.id,
        productName: data!.name,
        variantName: variant.name,
        price: variant.price,
        imageUrl: data!.images[0]?.url ?? null,
        stock: variant.stock,
      },
      quantity
    );
    setAdded(true);
  }

  return (
    <>
      <Stack.Screen options={{ title: data.name }} />
      <Screen
        footer={
          added ? (
            <View style={{ gap: space.sm }}>
              <Button label="Voir mon panier" icon="bag-handle-outline" onPress={() => router.push("/panier")} />
              <Button label="Continuer mes achats" variant="ghost" onPress={() => router.back()} />
            </View>
          ) : (
            <Button
              label={outOfStock ? "Rupture de stock" : `Ajouter · ${formatPrice((variant?.price ?? 0) * quantity)}`}
              icon="add-circle-outline"
              onPress={add}
              disabled={outOfStock}
            />
          )
        }
      >
        {data.images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.lg }}>
            {data.images.map((img) => (
              <Image
                key={img.url}
                source={{ uri: absoluteUrl(img.url) }}
                style={{ width, height: width * 0.85, backgroundColor: colors.orangeBg }}
                contentFit="cover"
                accessibilityLabel={img.alt ?? data.name}
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={{ gap: space.sm }}>
          <Text style={ui.title}>{data.name}</Text>
          {variant ? <Text style={[ui.strongOrange, { fontSize: 20 }]}>{formatPrice(variant.price)}</Text> : null}
        </View>

        {data.variants.length > 1 ? (
          <View style={{ gap: space.sm }}>
            <Text style={ui.label}>Format</Text>
            {data.variants.map((v) => (
              <ChoiceCard
                key={v.id}
                selected={variant?.id === v.id}
                onPress={() => {
                  setVariantId(v.id);
                  setQuantity(1);
                  setAdded(false);
                }}
                icon="pricetag-outline"
                title={`${v.name} · ${formatPrice(v.price)}`}
                subtitle={v.stock > 0 ? (v.stock <= 5 ? `Plus que ${v.stock} en stock` : undefined) : "Rupture de stock"}
              />
            ))}
          </View>
        ) : null}

        {!outOfStock ? (
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={ui.label}>Quantité</Text>
            <QuantityStepper
              value={quantity}
              onChange={(n) => {
                setQuantity(Math.max(1, n));
                setAdded(false);
              }}
              max={variant?.stock}
            />
          </View>
        ) : null}

        <Body>{data.description}</Body>
        <Muted>Livraison en France métropolitaine.</Muted>
      </Screen>
    </>
  );
}
