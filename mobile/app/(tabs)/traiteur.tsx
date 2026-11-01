import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Badge, Body, Button, Card, EmptyState, ErrorBox, Loading, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { absoluteUrl } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { TraiteurData, TraiteurDish } from "@/lib/types";
import { colors, space } from "@/lib/theme";

export default function TraiteurScreen() {
  const { data, error, loading, refreshing, refresh } = useApi<TraiteurData>("/api/mobile/traiteur");

  if (loading) return <Loading />;

  if (data && !data.enabled && !data.preview) {
    return (
      <Screen refreshing={refreshing} onRefresh={refresh}>
        <EmptyState
          icon="sparkles-outline"
          title="Bientôt disponible"
          text="Le service traiteur de Misou ouvre très vite. Revenez nous voir !"
        />
      </Screen>
    );
  }

  const categories = new Map<string, TraiteurDish[]>();
  for (const d of data?.dishes ?? []) {
    categories.set(d.category, [...(categories.get(d.category) ?? []), d]);
  }

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      footer={<Button label="Demander un devis" icon="document-text-outline" onPress={() => router.push("/devis")} />}
    >
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data?.preview ? <Badge label="Aperçu admin : le traiteur n’est pas encore ouvert au public" tone="orange" /> : null}
      <Body>
        Pour vos fêtes, baptêmes, anniversaires et événements, de 5 à 50 personnes. Choisissez vos plats, Misou vous
        envoie un devis.
      </Body>

      {[...categories.entries()].map(([cat, dishes]) => (
        <View key={cat} style={{ gap: space.md }}>
          <Text style={ui.eyebrow}>{cat}</Text>
          {dishes.map((d) => (
            <Card key={d.id} style={{ flexDirection: "row", gap: space.md }}>
              {d.photoUrl ? (
                <Image
                  source={{ uri: absoluteUrl(d.photoUrl) }}
                  style={{ width: 76, height: 76, borderRadius: 12, backgroundColor: colors.orangeBg }}
                  contentFit="cover"
                />
              ) : null}
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={ui.sectionTitle}>{d.name}</Text>
                {d.description ? <Body>{d.description}</Body> : null}
                {d.formats.length > 0 ? (
                  <Muted>
                    Dès {formatPrice(Math.min(...d.formats.map((f) => f.pricePerPerson)))} / pers. (indicatif)
                  </Muted>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      ))}
    </Screen>
  );
}
