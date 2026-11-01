import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminOrderRow } from "@/components/AdminOrderRow";
import { EmptyState, ErrorBox, Loading, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import { ORDER_STATUS_LABELS } from "@/lib/format";
import type { Order } from "@/lib/types";
import { colors, fonts, space } from "@/lib/theme";

const TYPES = [
  { value: "", label: "Tout" },
  { value: "lac", label: "LAC" },
  { value: "epicerie", label: "Épicerie" },
];
const STATUSES = ["", "new", "paid", "preparing", "shipped", "delivered", "cancelled"];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.orange : colors.border,
        backgroundColor: active ? colors.orange : colors.blanc,
      }}
    >
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 13, color: active ? colors.blanc : colors.textBody }}>{label}</Text>
    </Pressable>
  );
}

function Orders() {
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (status) params.set("status", status);
  if (search) params.set("q", search);
  const { data, error, loading, refreshing, refresh } = useApi<{ orders: Order[] }>(`/api/mobile/admin/orders?${params.toString()}`);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <TextInput
        value={q}
        onChangeText={setQ}
        onSubmitEditing={() => setSearch(q.trim())}
        onBlur={() => setSearch(q.trim())}
        placeholder="Rechercher : nom, email, n° de commande"
        placeholderTextColor={colors.grisChaud}
        returnKeyType="search"
        autoCapitalize="none"
        style={ui.input}
      />
      <View style={{ flexDirection: "row", gap: space.sm }}>
        {TYPES.map((t) => (
          <Chip key={t.value} label={t.label} active={type === t.value} onPress={() => setType(t.value)} />
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
        {STATUSES.map((s) => (
          <Chip key={s} label={s ? ORDER_STATUS_LABELS[s] : "Tous statuts"} active={status === s} onPress={() => setStatus(s)} />
        ))}
      </ScrollView>

      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data && data.orders.length === 0 ? <EmptyState icon="receipt-outline" title="Aucune commande" /> : null}
      {data?.orders.map((o) => <AdminOrderRow key={o.id} order={o} />)}
    </Screen>
  );
}

export default function AdminOrdersScreen() {
  return (
    <AdminGuard>
      <Orders />
    </AdminGuard>
  );
}
