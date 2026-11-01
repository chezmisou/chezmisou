import type { ReactNode } from "react";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Button, EmptyState, Loading, Screen } from "./ui";

/** N'affiche l'écran que pour les emails admin autorisés sur le site. */
export function AdminGuard({ children }: { children: ReactNode }) {
  const { ready, session, isAdmin } = useAuth();
  if (!ready) return <Loading />;
  if (!session || !isAdmin) {
    return (
      <Screen>
        <EmptyState
          icon="lock-closed-outline"
          title="Accès réservé"
          text="Connectez-vous avec un compte administrateur."
          action={<Button label="Se connecter" onPress={() => router.replace("/compte")} />}
        />
      </Screen>
    );
  }
  return <>{children}</>;
}
