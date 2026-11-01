import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Text, View } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import { Body, Button, Card, EmptyState, ErrorBox, Field, Loading, Muted, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";
import type { Order } from "@/lib/types";
import { API_URL } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";

function AuthForm() {
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [appleAvailable, setAppleAvailable] = useState(false);

  // « Se connecter avec Apple » : iPhone uniquement (exigé par l'App Store dès qu'il y a Google)
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync()
      .then(setAppleAvailable)
      .catch(() => setAppleAvailable(false));
  }, []);

  async function apple() {
    setError(null);
    setInfo(null);
    try {
      await signInWithApple();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion Apple impossible");
    }
  }
  const [googleLoading, setGoogleLoading] = useState(false);

  async function google() {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion Google impossible");
    } finally {
      setGoogleLoading(false);
    }
  }
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError("Entrez votre email et un mot de passe d’au moins 6 caractères.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        const r = await signUp(email, password);
        if (r.needsConfirmation) setInfo("Compte créé ! Confirmez votre email grâce au lien reçu, puis connectez-vous.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <SectionTitle hint="Retrouvez vos commandes et passez commande plus vite.">
        {mode === "login" ? "Se connecter" : "Créer un compte"}
      </SectionTitle>
      {error ? <View style={{ marginBottom: space.md }}><ErrorBox message={error} /></View> : null}
      {info ? (
        <View style={{ marginBottom: space.md, backgroundColor: colors.successBg, padding: space.md, borderRadius: 12 }}>
          <Body style={{ color: colors.success }}>{info}</Body>
        </View>
      ) : null}
      {appleAvailable ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={radius.md}
          style={{ height: 50, marginBottom: space.sm }}
          onPress={apple}
        />
      ) : null}
      <Button
        label="Continuer avec Google"
        icon="logo-google"
        variant="secondary"
        onPress={google}
        loading={googleLoading}
        disabled={loading}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginVertical: space.lg }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Muted>ou avec votre email</Muted>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
      />
      <Field
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        textContentType={mode === "login" ? "password" : "newPassword"}
        onSubmitEditing={submit}
      />
      <Button
        label={mode === "login" ? "Se connecter" : "Créer mon compte"}
        onPress={submit}
        loading={loading}
        disabled={googleLoading}
      />
      <Button
        label={mode === "login" ? "Pas encore de compte ? S’inscrire" : "Déjà un compte ? Se connecter"}
        variant="ghost"
        onPress={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError(null);
          setInfo(null);
        }}
        style={{ marginTop: space.sm }}
      />
    </Card>
  );
}

function MyOrders() {
  const { email, isAdmin, signOut, deleteAccount } = useAuth();
  const [deleting, setDeleting] = useState(false);

  function confirmDelete() {
    Alert.alert(
      "Supprimer mon compte ?",
      "Votre compte et vos données personnelles seront supprimés définitivement. Les commandes passées restent conservées pour la comptabilité.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              Alert.alert("Compte supprimé", "Votre compte a bien été supprimé.");
            } catch (e) {
              Alert.alert(
                "Suppression impossible",
                e instanceof Error ? e.message : "Réessayez ou écrivez à contact@chezmisou.com."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }
  const { data, error, loading, refreshing, refresh } = useApi<{ orders: Order[] }>("/api/mobile/me/orders");

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <Card style={{ gap: space.xs }}>
        <Muted>Connecté avec</Muted>
        <Text style={ui.sectionTitle}>{email}</Text>
        {isAdmin ? (
          <Button
            label="Ouvrir l’administration"
            icon="speedometer-outline"
            variant="secondary"
            onPress={() => router.push("/gestion")}
            style={{ marginTop: space.md }}
          />
        ) : null}
      </Card>

      <Text style={ui.sectionTitle}>Mes commandes</Text>
      {loading ? <Loading /> : null}
      {error ? <ErrorBox message={error} onRetry={refresh} /> : null}
      {data && data.orders.length === 0 ? (
        <EmptyState icon="receipt-outline" title="Aucune commande pour l’instant" text="Vos commandes apparaîtront ici." />
      ) : null}
      {data?.orders.map((o) => <OrderCard key={o.id} order={o} />)}

      <Button label="Se déconnecter" variant="secondary" icon="log-out-outline" onPress={signOut} />

      <View style={{ marginTop: space.lg, gap: space.sm }}>
        <Button
          label="Supprimer mon compte"
          variant="danger"
          icon="trash-outline"
          onPress={confirmDelete}
          loading={deleting}
        />
        <Muted style={{ textAlign: "center" }}>
          Confidentialité :{" "}
          <Text
            style={{ color: colors.orange, textDecorationLine: "underline" }}
            onPress={() => Linking.openURL(`${API_URL}/confidentialite`)}
          >
            chezmisou.com/confidentialite
          </Text>
        </Muted>
      </View>
    </Screen>
  );
}

export default function CompteScreen() {
  const { session, ready } = useAuth();
  if (!ready) return <Loading />;
  if (session) return <MyOrders />;
  return (
    <Screen>
      <AuthForm />
    </Screen>
  );
}
