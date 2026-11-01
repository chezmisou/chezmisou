import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
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

  async function signOut() {
    const client = await getSupabase();
    await client.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, email, isAdmin, ready, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
