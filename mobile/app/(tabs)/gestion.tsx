import { Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminOrderRow } from "@/components/AdminOrderRow";
import { Badge, Card, ErrorBox, Loading, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { capitalize, formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { colors, fonts, space } from "@/lib/theme";

interface Overview {
  toHandle: number;
  monthRevenue: number;
  monthOrders: number;
  newQuotes: number;
  nextLac: {
    id: string;
    serviceDate: string;
    orderDeadline: string;
    isPublished: boolean;
    orderCount: number;
    portions: number;
  } | null;
  recentOrders: Order[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={[ui.card, { flex: 1, gap: 4 }]}>
      <Text style={[ui.eyebrow, { marginBottom: 0 }]}>{label}</Text>
      <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.marronProfond }}>{value}</Text>
    </View>
  );
}

function Shortcut({ icon, label, onPress, badge }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void; badge?: number }) {
  return (
    <Card onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: space.md, paddingVertical: space.md }}>
      <Ionicons name={icon} size={22} color={colors.orange} />
      <Text style={[ui.body, { flex: 1, fontFamily: fonts.sansBold, color: colors.marronProfond }]}>{label}</Text>
      {badge ? <Badge label={String(badge)} tone="orange" /> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.grisChaud} />
    </Card>
  );
}

function Dashboard() {
  const { data, error, loading, refreshing, refresh } = useApi<Overview>("/api/mobile/admin/overview");
  if (loading) return <Loading />;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data ? (
        <>
          <View style={{ flexDirection: "row", gap: space.md }}>
            <Stat label="À traiter" value={String(data.toHandle)} />
            <Stat label="Ce mois-ci" value={formatPrice(data.monthRevenue)} />
          </View>

          {data.nextLac ? (
            <Card onPress={() => router.push(`/admin/lac/${data.nextLac!.id}`)} style={{ gap: 6 }}>
              <Text style={ui.eyebrow}>Prochain LAC</Text>
              <Text style={ui.sectionTitle}>{capitalize(formatDate(data.nextLac.serviceDate))}</Text>
              <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
                <Badge label={`${data.nextLac.orderCount} commande${data.nextLac.orderCount > 1 ? "s" : ""}`} tone="orange" />
                <Badge label={`${data.nextLac.portions} portion${data.nextLac.portions > 1 ? "s" : ""}`} />
                {!data.nextLac.isPublished ? <Badge label="Non publié" tone="red" /> : null}
              </View>
              <Muted>Voir la liste de préparation</Muted>
            </Card>
          ) : null}

          <View style={{ gap: space.sm }}>
            <Shortcut icon="receipt-outline" label="Commandes" onPress={() => router.push("/admin/commandes")} badge={data.toHandle} />
            <Shortcut icon="restaurant-outline" label="Menus LAC" onPress={() => router.push("/admin/lac")} />
            <Shortcut icon="document-text-outline" label="Devis traiteur" onPress={() => router.push("/admin/devis")} badge={data.newQuotes} />
            <Shortcut icon="settings-outline" label="Paramètres" onPress={() => router.push("/admin/parametres")} />
          </View>

          <Text style={ui.sectionTitle}>Dernières commandes</Text>
          {data.recentOrders.map((o) => (
            <AdminOrderRow key={o.id} order={o} />
          ))}
          <Muted style={{ textAlign: "center" }}>
            Produits, codes promo et plats traiteur se gèrent sur le site, dans l’admin.
          </Muted>
        </>
      ) : null}
    </Screen>
  );
}

export default function GestionScreen() {
  return (
    <AdminGuard>
      <Dashboard />
    </AdminGuard>
  );
}
