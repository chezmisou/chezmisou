import { NextResponse } from "next/server";
import { getLacPickupSettings } from "@/lib/lac-delivery-server";

export const dynamic = "force-dynamic";

/** Églises de retrait et grille de livraison, pour la page de commande LAC. */
export async function GET() {
  const { churches, tiers } = await getLacPickupSettings();
  return NextResponse.json({ churches, tiers });
}
