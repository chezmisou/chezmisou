import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { api } from "@/lib/api";

interface AuthState {
  session: Session | null;
  email: string | null;
  isAdmin: boolean;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>;
  /** Connexion ou création de compte avec Google. false si l'utilisateur a annulé. */
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function translateAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Email ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message))
    return "Confirmez d'abord votre email grâce au lien reçu.";
  if (/already registered/i.test(message)) return "Un compte existe déjà avec cet email.";
  if (/password should be at least/i.test(message))
    return "Le mot de passe doit contenir au moins 6 caractères.";
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    getSupabase()
      .then(async (client) => {
        const { data } = await client.auth.getSession();
        if (cancelled) return;
        setSession(data.session);
        const sub = client.auth.onAuthStateChange((_event, s) => setSession(s));
        unsubscribe = () => sub.data.subscription.unsubscribe();
      })
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const email = session?.user.email ?? null;

  // L'onglet Admin n'apparaît que pour les emails autorisés côté site
  useEffect(() => {
    let cancelled = false;
    if (!email) {
      Promise.resolve().then(() => !cancelled && setIsAdmin(false));
      return () => {
        cancelled = true;
      };
    }
    api<{ allowed: boolean }>("/api/admin/check-allowed-email", { body: { email }, auth: false })
      .then((r) => !cancelled && setIsAdmin(r.allowed))
      .catch(() => !cancelled && setIsAdmin(false));
    return () => {
      cancelled = true;
    };
  }, [email]);

  async function signIn(mail: string, password: string) {
    const client = await getSupabase();
    const { error } = await client.auth.signInWithPassword({ email: mail.trim(), password });
    if (error) throw new Error(translateAuthError(error.message));
  }

  async function signUp(mail: string, password: string) {
    const client = await getSupabase();
    const { data, error } = await client.auth.signUp({ email: mail.trim(), password });
    if (error) throw new Error(translateAuthError(error.message));
    return { needsConfirmation: !data.session };
  }

  async function signInWithGoogle(): Promise<boolean> {
    const client = await getSupabase();
    // Adresse de retour dans l'app : exp://…/--/auth-callback dans Expo Go,
    // chezmisou://auth-callback dans l'app publiée.
    const redirectTo = Linking.createURL("auth-callback");
    const { data, error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data?.url) throw new Error("Impossible de se connecter avec Google pour le moment.");

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return false;

    const { queryParams } = Linking.parse(result.url);
    const fragment = new URLSearchParams(result.url.split("#")[1] ?? "");
    const errorDescription =
      (queryParams?.error_description as string | undefined) ?? fragment.get("error_description");
    if (errorDescription) throw new Error(`Connexion Google refusée : ${errorDescription}`);

    const code = queryParams?.code as string | undefined;
    if (code) {
      const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);
      if (exchangeError) throw new Error("La connexion Google n'a pas abouti. Réessayez.");
      return true;
    }
    // Repli (flux implicite) : jetons dans le fragment de l'URL
    const accessToken = fragment.get("access_token");
    const refreshToken = fragment.get("refresh_token");
    if (accessToken && refreshToken) {
      const { error: setError } = await client.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (setError) throw new Error("La connexion Google n'a pas abouti. Réessayez.");
      return true;
    }
    throw new Error(
      "Google n'a pas renvoyé vers l'app. L'adresse de retour de l'app doit être autorisée dans Supabase (voir mobile/README.md)."
    );
  }

  async function signOut() {
    const client = await getSupabase();
    await client.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, email, isAdmin, ready, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
