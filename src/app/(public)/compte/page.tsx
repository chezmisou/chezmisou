import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, LogOut, Mail, User as UserIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { syncCustomerProfile } from "@/lib/auth/syncCustomerProfile";
import { signOutAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  let profile: Awaited<ReturnType<typeof syncCustomerProfile>> = null;
  try {
    profile = await syncCustomerProfile(user);
  } catch (err) {
    console.error("syncCustomerProfile (compte) failed:", err);
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metadataFirst =
    (metadata.firstName as string | undefined) ??
    (metadata.first_name as string | undefined) ??
    (typeof metadata.given_name === "string"
      ? (metadata.given_name as string)
      : undefined);
  const metadataLast =
    (metadata.lastName as string | undefined) ??
    (metadata.last_name as string | undefined) ??
    (typeof metadata.family_name === "string"
      ? (metadata.family_name as string)
      : undefined);

  const firstName = profile?.firstName ?? metadataFirst ?? "";
  const lastName = profile?.lastName ?? metadataLast ?? "";
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") || user.email;

  return (
    <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-text-dark mb-2">
        Mon compte
      </h1>
      <p className="text-text-body mb-8">
        Bienvenue {firstName || ""}
        {firstName && "\u00a0"}! Ravi de vous retrouver.
      </p>

      <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold text-marron-profond mb-4">
          Vos informations
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <UserIcon size={18} className="text-orange mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gris-chaud">Nom</p>
              <p className="text-marron-profond font-medium">{displayName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-orange mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gris-chaud">Email</p>
              <p className="text-marron-profond font-medium break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 p-6 mb-6">
        <h2 className="font-serif text-lg font-semibold text-marron-profond mb-4">
          Vos commandes
        </h2>
        <Link
          href="/mes-commandes"
          className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
        >
          <Package size={18} />
          Voir mes commandes
        </Link>
      </div>

      <form action={signOutAction}>
        <button
          type="submit"
          className="inline-flex items-center gap-2 text-marron-profond hover:text-orange transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
