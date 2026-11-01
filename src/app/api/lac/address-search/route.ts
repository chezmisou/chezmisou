import { NextRequest, NextResponse } from "next/server";
import { searchAddresses } from "@/lib/lac-delivery-server";
import { isIdfPostcode } from "@/lib/lac-delivery";

export const dynamic = "force-dynamic";

/** Autocomplétion d'adresse pour la livraison LAC (Île-de-France). */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  if (q.trim().length < 3) return NextResponse.json({ results: [] });
  try {
    const results = await searchAddresses(q, { limit: 8 });
    return NextResponse.json({
      results: results
        .filter((r) => r.line1 && isIdfPostcode(r.postalCode))
        .slice(0, 5)
        .map(({ label, line1, postalCode, city }) => ({ label, line1, postalCode, city })),
    });
  } catch (err) {
    console.error("[lac/address-search]", err);
    return NextResponse.json({ results: [] });
  }
}
