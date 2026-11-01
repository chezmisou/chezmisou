import { Text, View } from "react-native";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AdminGuard } from "@/components/AdminGuard";
import { Badge, Button, Card, EmptyState, ErrorBox, Loading, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { capitalize, formatDate } from "@/lib/format";
import { colors, space } from "@/lib/theme";

interface MenuRow {
  id: string;
  serviceDate: string;
  orderDeadline: string;
  isPublished: boolean;
  dishCount: number;
  orderCount: number;
}

function Menus() {
  const { data, error, loading, refreshing, refresh } = useApi<{ menus: MenuRow[] }>("/api/mobile/admin/lac");
  if (loading) return <Loading />;
  const now = Date.now();

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={refresh}
      footer={<Button label="Nouveau menu" icon="add" onPress={() => router.push("/admin/lac/menu")} />}
    >
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data && data.menus.length === 0 ? (
        <EmptyState icon="restaurant-outline" title="Aucun menu" text="Créez le menu du prochain dimanche." />
      ) : null}
      {data?.menus.map((m) => {
        const past = new Date(m.serviceDate).getTime() < now - 24 * 3600 * 1000;
        return (
          <Card key={m.id} onPress={() => router.push(`/admin/lac/${m.id}`)} style={{ gap: 6, opacity: past ? 0.7 : 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[ui.sectionTitle, { flex: 1 }]}>{capitalize(formatDate(m.serviceDate))}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.grisChaud} />
            </View>
            <View style={{ flexDirection: "row", gap: space.sm, flexWrap: "wrap" }}>
              {m.isPublished ? <Badge label="Publié" tone="green" /> : <Badge label="Brouillon" />}
              {past ? <Badge label="Passé" /> : null}
              <Badge label={`${m.orderCount} commande${m.orderCount > 1 ? "s" : ""}`} tone="orange" />
            </View>
            <Muted>{m.dishCount} plat{m.dishCount > 1 ? "s" : ""}</Muted>
          </Card>
        );
      })}
    </Screen>
  );
}

export default function AdminLacScreen() {
  return (
    <AdminGuard>
      <Stack.Screen options={{ title: "Menus LAC" }} />
      <Menus />
    </AdminGuard>
  );
}
