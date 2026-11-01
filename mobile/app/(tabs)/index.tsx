import { Image, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, Card, Eyebrow, Muted, Screen, styles as ui } from "@/components/ui";
import { useApi } from "@/lib/useApi";
import type { LacData } from "@/lib/types";
import { capitalize, formatDate, formatDateTime } from "@/lib/format";
import { colors, fonts, space } from "@/lib/theme";

const logo = require("../../assets/logo.png");

export default function HomeScreen() {
  const { data, refreshing, refresh } = useApi<LacData>("/api/mobile/lac");
  const menu = data?.menu;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={{ alignItems: "center", gap: space.sm, paddingVertical: space.md }}>
        <Image source={logo} style={{ width: 110, height: 110, borderRadius: 55 }} accessibilityLabel="Chez Misou" />
        <Text style={[ui.title, { textAlign: "center" }]}>La cuisine haïtienne de Misou</Text>
        <Muted style={{ textAlign: "center" }}>Faite avec amour, à Chelles.</Muted>
      </View>

      <Card style={{ backgroundColor: colors.marronProfond, borderColor: colors.marronProfond }}>
        <Text style={{ fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 1.2, color: colors.orangeClair, textTransform: "uppercase" }}>
          Lunch After Church
        </Text>
        {menu ? (
          <>
            <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.blancCreme, marginTop: space.sm }}>
              Menu du {capitalize(formatDate(menu.serviceDate))}
            </Text>
            <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: "#E9D9C6", marginTop: space.xs }}>
              {menu.isOpen
                ? `Commandez avant ${formatDateTime(menu.orderDeadline)}`
                : "Les commandes sont fermées pour ce dimanche."}
            </Text>
            <Button
              label="Voir le menu"
              icon="restaurant-outline"
              onPress={() => router.push("/lac")}
              style={{ marginTop: space.lg }}
            />
          </>
        ) : (
          <Text style={{ fontFamily: fonts.sans, fontSize: 15, color: "#E9D9C6", marginTop: space.sm }}>
            Le prochain menu du dimanche arrive bientôt.
          </Text>
        )}
      </Card>

      <Eyebrow>Aussi chez Misou</Eyebrow>
      <Card onPress={() => router.push("/epicerie")} style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <Ionicons name="basket-outline" size={28} color={colors.orange} />
        <View style={{ flex: 1 }}>
          <Text style={ui.sectionTitle}>Épicerie fine</Text>
          <Body>Épices, sauces et douceurs haïtiennes livrées en France.</Body>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.grisChaud} />
      </Card>
      <Card onPress={() => router.push("/traiteur")} style={{ flexDirection: "row", gap: space.md, alignItems: "center" }}>
        <Ionicons name="people-outline" size={28} color={colors.orange} />
        <View style={{ flex: 1 }}>
          <Text style={ui.sectionTitle}>Traiteur</Text>
          <Body>Pour vos fêtes et événements, de 5 à 50 personnes.</Body>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.grisChaud} />
      </Card>
    </Screen>
  );
}
