import { NextRequest, NextResponse } from "next/server";
import { quoteLacDelivery } from "@/lib/lac-delivery-server";

export const dynamic = "force-dynamic";

/** Prix de livraison LAC pour une adresse, selon la distance depuis Chelles. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const line1 = typeof body?.line1 === "string" ? body.line1.trim() : "";
  const postalCode = typeof body?.postalCode === "string" ? body.postalCode.trim() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  if (!line1 || !postalCode || !city) {
    return NextResponse.json({ ok: false, error: "Adresse incomplète" }, { status: 400 });
  }
  const quote = await quoteLacDelivery({ line1, postalCode, city });
  return NextResponse.json(quote);
}
