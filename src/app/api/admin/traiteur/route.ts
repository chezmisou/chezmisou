import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, description, category, baseInfo, photoUrl, isActive, formats } = body;

    if (!name || !formats?.length) {
      return NextResponse.json(
        { error: "Le nom et au moins un format sont requis" },
        { status: 400 }
      );
    }

    const dish = await prisma.$transaction(async (tx) => {
      const d = await tx.traiteurDish.create({
        data: {
          name,
          description: description || null,
          category: category || null,
          baseInfo: baseInfo || null,
          photoUrl: photoUrl || null,
          isActive: isActive !== false,
        },
      });

      if (formats.length > 0) {
        await tx.traiteurDishFormat.createMany({
          data: formats.map(
            (f: { minPeople: number; maxPeople: number; indicativePricePerPerson: number }) => ({
              traiteurDishId: d.id,
              minPeople: parseInt(String(f.minPeople)),
              maxPeople: parseInt(String(f.maxPeople)),
              indicativePricePerPerson: parseFloat(String(f.indicativePricePerPerson)),
            })
          ),
        });
      }

      return d;
    });

    return NextResponse.json(dish, { status: 201 });
  } catch (err) {
    console.error("Error creating traiteur dish:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du plat" },
      { status: 500 }
    );
  }
}
