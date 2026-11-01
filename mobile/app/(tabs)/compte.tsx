import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Body, Button, Card, EmptyState, ErrorBox, Field, Loading, Muted, Screen, SectionTitle, styles as ui } from "@/components/ui";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/useApi";
import { supabaseConfigured } from "@/lib/supabase";
import type { Order } from "@/lib/types";
import { colors, space } from "@/lib/theme";

function AuthForm() {
  const { signIn, signUp } = useAuth();
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
      <Button label={mode === "login" ? "Se connecter" : "Créer mon compte"} onPress={submit} loading={loading} />
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
  const { email, isAdmin, signOut } = useAuth();
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

      <Button label="Se déconnecter" variant="danger" icon="log-out-outline" onPress={signOut} />
    </Screen>
  );
}

export default function CompteScreen() {
  const { session, ready } = useAuth();
  if (!ready) return <Loading />;
  if (session) return <MyOrders />;
  return (
    <Screen>
      {!supabaseConfigured ? (
        <ErrorBox message="Connexion indisponible : configuration Supabase manquante (voir mobile/README.md)." />
      ) : null}
      <AuthForm />
    </Screen>
  );
}
