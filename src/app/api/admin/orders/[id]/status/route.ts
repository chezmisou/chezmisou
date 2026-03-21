import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const ADMIN_PASSWORD = "churchlunch2024";

function checkAuth(request: NextRequest) {
  const password = request.headers.get("x-admin-password");
  return password === ADMIN_PASSWORD;
}

// Workflow: PENDING → CONFIRMED → PREPARING → READY → DELIVERED
// CANCELLED is possible from any status except DELIVERED
const STATUS_WORKFLOW: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

// PATCH /api/admin/orders/[id]/status — Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status: newStatus } = body;

    if (!newStatus || !Object.values(OrderStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      select: { status: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    const allowedStatuses = STATUS_WORKFLOW[order.status] || [];
    if (!allowedStatuses.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Transition de statut non autorisée: ${order.status} → ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: { status: newStatus },
        include: {
          user: { select: { name: true, email: true, phone: true } },
          items: true,
          statusHistory: { orderBy: { changedAt: "desc" } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: params.id,
          status: newStatus,
          changedBy: "admin",
        },
      });

      return updatedOrder;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}
