import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { Body, Button, EmptyState, ErrorBox, Field, Screen, styles as ui } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { colors, fonts, radius, space } from "@/lib/theme";

const MOODS = [
  { value: "bien", emoji: "😀", label: "Content" },
  { value: "bof", emoji: "😐", label: "Mitigé" },
  { value: "pas_bien", emoji: "🙁", label: "Pas content" },
] as const;

/** « Un retour ? » : avis libre, sans compte, envoyé par email à Misou. */
export default function RetourScreen() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  const { email: accountEmail } = useAuth();
  const [mood, setMood] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(accountEmail ?? "");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (message.trim().length < 3) {
      setError("Écrivez quelques mots avant d'envoyer.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api("/api/feedback", {
        body: {
          message,
          email: email.trim(),
          mood,
          page: page ?? "",
          source: "app",
          device: `${Platform.OS} · v${Constants.expoConfig?.version ?? "?"}`,
        },
        auth: false,
      });
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi impossible. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Screen>
        <EmptyState
          icon="heart-outline"
          title="Mèsi anpil !"
          text="Votre retour a bien été envoyé à Misou."
          action={<Button label="Fermer" onPress={() => router.back()} />}
        />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button label="Envoyer" icon="send-outline" onPress={send} loading={sending} />}>
      <Body>Une idée, un souci, un compliment : dites-le-nous.</Body>

      <View style={{ flexDirection: "row", gap: space.sm }} accessibilityRole="radiogroup">
        {MOODS.map((m) => {
          const on = mood === m.value;
          return (
            <Pressable
              key={m.value}
              onPress={() => setMood(on ? null : m.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={m.label}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 4,
                paddingVertical: space.md,
                borderRadius: radius.md,
                borderWidth: 2,
                borderColor: on ? colors.orange : "#EFE4D6",
                backgroundColor: on ? "#FFF4EA" : colors.blanc,
              }}
            >
              <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
              <Text style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.textBody }}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Field
        label="Votre message"
        value={message}
        onChangeText={(t) => {
          setMessage(t);
          setError(null);
        }}
        multiline
        maxLength={3000}
        placeholder="Votre message…"
        autoFocus
        style={{ minHeight: 120 }}
      />
      <Field
        label="Email (facultatif, si vous voulez une réponse)"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder="vous@exemple.com"
      />
      {error ? <ErrorBox message={error} /> : null}
      <View style={{ flexDirection: "row", gap: space.xs, alignItems: "center" }}>
        <Ionicons name="lock-closed-outline" size={13} color={colors.grisChaud} />
        <Text style={ui.muted}>Pas besoin de compte. Votre retour est lu par Misou.</Text>
      </View>
    </Screen>
  );
}
