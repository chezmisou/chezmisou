import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { orderInclude, serializeOrder } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Détail d'une commande. Le changement de statut passe par /api/admin/commandes/[id]/status. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: orderInclude });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json(serializeOrder(order));
}
