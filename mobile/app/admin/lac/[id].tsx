import { useState } from "react";
import { Switch, Text, View } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminOrderRow } from "@/components/AdminOrderRow";
import { Badge, Button, Card, ErrorBox, Loading, Muted, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { api } from "@/lib/api";
import { capitalize, formatDate, formatDateTime, formatPrice } from "@/lib/format";
import type { LacPrep } from "@/lib/types";
import { colors, fonts, space } from "@/lib/theme";


function Prep() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, refreshing, refresh, setData } = useApi<LacPrep>(`/api/mobile/admin/lac/${id}`);
  const [publishing, setPublishing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (error || !data) return <Screen><ErrorBox message={error || "Menu introuvable"} onRetry={refresh} /></Screen>;

  const orderCount = data.pickupGroups.reduce((s, g) => s + g.orders.length, 0) + data.deliveries.length;
  const portions = data.dishes.reduce((s, d) => s + d.ordered, 0);

  async function togglePublish(value: boolean) {
    setPublishing(true);
    setActionError(null);
    try {
      await api(`/api/admin/lac/${data!.menu.id}`, { method: "PATCH", body: { isPublished: value } });
      setData({ ...data!, menu: { ...data!.menu, isPublished: value } });
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: capitalize(formatDate(data.menu.serviceDate, false)),
        }}
      />
      <Screen refreshing={refreshing} onRefresh={refresh}>
        {actionError ? <ErrorBox message={actionError} /> : null}
        <Card style={{ gap: space.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              <Text style={[ui.body, { fontFamily: fonts.sansBold }]}>Publié sur le site et l’app</Text>
              <Muted>Commandes jusqu’au {formatDateTime(data.menu.orderDeadline)}</Muted>
            </View>
            <Switch
              value={data.menu.isPublished}
              onValueChange={togglePublish}
              disabled={publishing}
              trackColor={{ true: colors.orange, false: colors.border }}
              thumbColor={colors.blanc}
              accessibilityLabel="Publier le menu"
            />
          </View>
          <Button
            label="Modifier le menu"
            icon="create-outline"
            variant="secondary"
            onPress={() => router.push({ pathname: "/admin/lac/menu", params: { id: data.menu.id } })}
          />
        </Card>

        <View style={{ flexDirection: "row", gap: space.md }}>
          <Card style={{ flex: 1 }}>
            <Text style={ui.eyebrow}>Commandes</Text>
            <Text style={ui.title}>{orderCount}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text style={ui.eyebrow}>Portions</Text>
            <Text style={ui.title}>{portions}</Text>
          </Card>
        </View>
        <Muted>Chiffre d’affaires : {formatPrice(data.revenue)}</Muted>

        <Card>
          <SectionTitle>À cuisiner</SectionTitle>
          {data.dishes.map((d) => (
            <View key={d.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F4ECE2" }}>
              <View style={{ flex: 1 }}>
                <Text style={[ui.body, { fontFamily: fonts.sansBold, color: colors.marronProfond }]}>{d.name}</Text>
                {d.maxQuantity != null ? <Muted>sur {d.maxQuantity} max.</Muted> : null}
              </View>
              <Text style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.orange }}>{d.ordered}</Text>
            </View>
          ))}
        </Card>

        {data.pickupGroups.map((g) => (
          <View key={g.church} style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
              <Text style={ui.sectionTitle}>{g.church}</Text>
              <Badge label={String(g.orders.length)} tone="orange" />
            </View>
            {g.orders.map((o) => <AdminOrderRow key={o.id} order={o} showItems />)}
          </View>
        ))}

        {data.deliveries.length > 0 ? (
          <View style={{ gap: space.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm }}>
              <Text style={ui.sectionTitle}>Livraisons</Text>
              <Badge label={String(data.deliveries.length)} tone="orange" />
            </View>
            <Muted>Triées de la plus proche à la plus éloignée de Chelles.</Muted>
            {data.deliveries.map((o) => <AdminOrderRow key={o.id} order={o} showItems />)}
          </View>
        ) : null}
        {orderCount === 0 ? <Muted style={{ textAlign: "center" }}>Aucune commande pour l’instant.</Muted> : null}
      </Screen>
    </>
  );
}

export default function AdminLacPrepScreen() {
  return (
    <AdminGuard>
      <Prep />
    </AdminGuard>
  );
}
