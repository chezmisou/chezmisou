import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/lac/recurrence/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { frequency, isActive, startDate, endDate } = body;

    const existing = await prisma.recurrenceRule.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    }

    const rule = await prisma.recurrenceRule.update({
      where: { id: params.id },
      data: {
        ...(frequency !== undefined && { frequency }),
        ...(isActive !== undefined && { isActive }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error("Error updating recurrence rule:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/lac/recurrence/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const existing = await prisma.recurrenceRule.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Règle non trouvée" }, { status: 404 });
    }

    await prisma.recurrenceRule.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Règle supprimée" });
  } catch (error) {
    console.error("Error deleting recurrence rule:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
