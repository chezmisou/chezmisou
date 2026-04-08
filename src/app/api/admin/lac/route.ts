import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { serviceDate, orderDeadline, deliveryZoneText, isPublished, dishes } = body;

    if (!serviceDate || !orderDeadline) {
      return NextResponse.json(
        { error: "La date de service et la deadline sont requises" },
        { status: 400 }
      );
    }

    if (!dishes || dishes.length === 0) {
      return NextResponse.json(
        { error: "Au moins un plat est requis" },
        { status: 400 }
      );
    }

    const menu = await prisma.$transaction(async (tx) => {
      const m = await tx.lacMenu.create({
        data: {
          serviceDate: new Date(serviceDate),
          orderDeadline: new Date(orderDeadline),
          deliveryZoneText: deliveryZoneText || null,
          isPublished: !!isPublished,
        },
      });

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
            lacMenuId: m.id,
            name: d.name,
            description: d.description || null,
            photoUrl: d.photoUrl || null,
            price: parseFloat(String(d.price)) || 0,
            maxQuantity: d.maxQuantity ? parseInt(String(d.maxQuantity)) : null,
            position: i,
          })
        ),
      });

      return m;
    });

    return NextResponse.json(menu, { status: 201 });
  } catch (err) {
    console.error("Error creating LAC menu:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du menu" },
      { status: 500 }
    );
  }
}
