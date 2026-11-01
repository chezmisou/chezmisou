import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe-server";

export const dynamic = "force-dynamic";

/**
 * Après un paiement par carte ouvert depuis l'app : la commande existe-t-elle ?
 * « paid » : commande créée ; « processing » : payé, commande en cours de création ;
 * « unpaid » : paiement non finalisé.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Session invalide" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    select: { orderNumber: true },
  });
  if (order) return NextResponse.json({ status: "paid", orderNumber: order.orderNumber });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" || session.status === "complete") {
      return NextResponse.json({ status: "processing" });
    }
  } catch (err) {
    console.error("[mobile/checkout-status]", err);
  }
  return NextResponse.json({ status: "unpaid" });
}
