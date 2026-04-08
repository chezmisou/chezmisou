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
    const existing = await prisma.traiteurDish.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Plat introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const { name, description, category, baseInfo, photoUrl, isActive, formats } = body;

    const dish = await prisma.$transaction(async (tx) => {
      const d = await tx.traiteurDish.update({
        where: { id },
        data: {
          name: name || existing.name,
          description: description ?? existing.description,
          category: category ?? existing.category,
          baseInfo: baseInfo ?? existing.baseInfo,
          photoUrl: photoUrl ?? existing.photoUrl,
          isActive: isActive !== undefined ? !!isActive : undefined,
        },
      });

      if (formats) {
        await tx.traiteurDishFormat.deleteMany({ where: { traiteurDishId: id } });
        if (formats.length > 0) {
          await tx.traiteurDishFormat.createMany({
            data: formats.map(
              (f: { minPeople: number; maxPeople: number; indicativePricePerPerson: number }) => ({
                traiteurDishId: id,
                minPeople: parseInt(String(f.minPeople)),
                maxPeople: parseInt(String(f.maxPeople)),
                indicativePricePerPerson: parseFloat(String(f.indicativePricePerPerson)),
              })
            ),
          });
        }
      }

      return d;
    });

    return NextResponse.json(dish);
  } catch (err) {
    console.error("Error updating traiteur dish:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
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
    await prisma.traiteurDish.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting traiteur dish:", err);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
