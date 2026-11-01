import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, Card, Muted, Screen, styles as ui } from "@/components/ui";
import { formatPrice } from "@/lib/format";
import { colors, space } from "@/lib/theme";

export default function ConfirmationScreen() {
  const { type, order, payment, total } = useLocalSearchParams<{
    type?: string;
    order?: string;
    payment?: string;
    total?: string;
  }>();
  const isLac = type === "lac";
  const isCash = payment === "cash";

  return (
    <Screen>
      <View style={{ alignItems: "center", gap: space.md, paddingTop: space.xl }}>
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.successBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="checkmark" size={44} color={colors.success} />
        </View>
        <Text style={[ui.title, { textAlign: "center" }]}>Merci pour votre commande !</Text>
        {order ? (
          <Body style={{ textAlign: "center" }}>
            Commande N° <Text style={{ fontWeight: "700" }}>{order}</Text>
          </Body>
        ) : null}
        <Muted style={{ textAlign: "center" }}>Un email de confirmation vient de vous être envoyé.</Muted>
      </View>

      {isLac && isCash ? (
        <Card style={{ backgroundColor: colors.orangeBg, borderColor: colors.orangeBg }}>
          <Text style={ui.sectionTitle}>Paiement en espèces</Text>
          <Body>
            Prévoyez {total ? formatPrice(Number(total)) : "le montant de la commande"} dimanche. L’appoint est très
            apprécié !
          </Body>
        </Card>
      ) : null}

      <Card>
        <Body>
          {isLac
            ? "Misou cuisine avec amour. Vous retrouverez tous les détails (lieu de retrait ou livraison) dans l’email de confirmation."
            : "Votre colis sera préparé avec soin. Vous recevrez un email à chaque étape."}
        </Body>
      </Card>

      <Button label="Retour à l’accueil" onPress={() => router.replace("/")} />
      <Button label="Mes commandes" variant="secondary" onPress={() => router.replace("/compte")} />
    </Screen>
  );
}
