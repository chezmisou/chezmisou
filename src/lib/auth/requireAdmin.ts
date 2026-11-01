import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Utilisateur connecté : via le cookie de session (site) ou via
 * l'en-tête « Authorization: Bearer <jeton> » (app mobile).
 */
export async function getRequestUser(): Promise<User | null> {
  const supabase = await createClient();
  const auth = (await headers()).get("authorization");
  const token = auth?.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : null;
  const {
    data: { user },
  } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
  return user ?? null;
}

export async function requireAdmin() {
  const user = await getRequestUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }),
      user: null,
    };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email!.toLowerCase())) {
    return {
      error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}

/** Version non bloquante : indique si le visiteur courant est admin. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  try {
    const user = await getRequestUser();
    if (!user?.email) return false;

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    return adminEmails.includes(user.email.toLowerCase());
  } catch {
    return false;
  }
}
