import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
