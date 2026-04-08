import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.lacMenu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const { serviceDate, orderDeadline, deliveryZoneText, isPublished, dishes } = body;

    const menu = await prisma.$transaction(async (tx) => {
      const m = await tx.lacMenu.update({
        where: { id },
        data: {
          serviceDate: serviceDate ? new Date(serviceDate) : undefined,
          orderDeadline: orderDeadline ? new Date(orderDeadline) : undefined,
          deliveryZoneText: deliveryZoneText !== undefined ? (deliveryZoneText || null) : undefined,
          isPublished: isPublished !== undefined ? !!isPublished : undefined,
        },
      });

      if (dishes) {
        await tx.lacDish.deleteMany({ where: { lacMenuId: id } });
        if (dishes.length > 0) {
          await tx.lacDish.createMany({
            data: dishes.map(
              (
                d: {
                  name: string;
                  description?: string;
                  photoUrl?: string;
                  price: number;
                  maxQuantity?: number;
                },
                i: number
              ) => ({
                lacMenuId: id,
                name: d.name,
                description: d.description || null,
                photoUrl: d.photoUrl || null,
                price: parseFloat(String(d.price)) || 0,
                maxQuantity: d.maxQuantity ? parseInt(String(d.maxQuantity)) : null,
                position: i,
              })
            ),
          });
        }
      }

      return m;
    });

    return NextResponse.json(menu);
  } catch (err) {
    console.error("Error updating LAC menu:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du menu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const existing = await prisma.lacMenu.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
    }

    const paidOrderCount = await prisma.order.count({
      where: { type: "lac", lacMenuId: id, paymentStatus: "paid" },
    });

    if (paidOrderCount > 0) {
      return NextResponse.json(
        { error: "Ce menu a déjà des commandes payées, il ne peut pas être supprimé." },
        { status: 409 }
      );
    }

    await prisma.lacMenu.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting LAC menu:", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du menu" },
      { status: 500 }
    );
  }
}
