import { Pressable, Text } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fonts } from "@/lib/theme";

/** Petit bouton « Un retour ? » placé dans l'en-tête de chaque onglet. */
export function FeedbackHeaderButton() {
  const pathname = usePathname();
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/retour", params: { page: pathname } })}
      accessibilityRole="button"
      accessibilityLabel="Un retour ? Envoyer un avis"
      hitSlop={8}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 6,
        marginRight: 12,
        borderRadius: 999,
        backgroundColor: pressed ? colors.orangeBg : "#F4ECE2",
      })}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={15} color={colors.marronProfond} />
      <Text style={{ fontFamily: fonts.sansMedium, fontSize: 12, color: colors.marronProfond }}>Un retour ?</Text>
    </Pressable>
  );
}
