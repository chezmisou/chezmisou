import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { OrderStatus } from "@prisma/client";

const validStatuses = Object.values(OrderStatus);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
      },
    });

    return NextResponse.json(order);
  } catch (err) {
    console.error("Error updating order status:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
