import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/requireAdmin";
import { deleteAccount } from "@/lib/auth/deleteAccount";

export const dynamic = "force-dynamic";

/** Suppression du compte du client connecté (site : cookie ; app : jeton Bearer). */
export async function POST() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Connectez-vous pour supprimer votre compte." }, { status: 401 });
  }
  try {
    await deleteAccount(user);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[account/delete]", err);
    return NextResponse.json(
      { error: "La suppression n'a pas pu aboutir. Réessayez ou écrivez à contact@chezmisou.com." },
      { status: 500 }
    );
  }
}
