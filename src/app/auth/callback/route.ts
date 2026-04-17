import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncCustomerProfile } from "@/lib/auth/syncCustomerProfile";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/compte";
  const next = nextParam.startsWith("/") ? nextParam : "/compte";

  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/connexion?error=oauth_failed`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await syncCustomerProfile(user);
    } catch (err) {
      console.error("syncCustomerProfile (callback) failed:", err);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
