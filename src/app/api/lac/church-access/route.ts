import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/church-access — Check if the logged-in church user has access today
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "CHURCH_MANAGER") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const churchId = (session.user as any).churchId;
  if (!churchId) {
    return NextResponse.json(
      { error: "Aucune église associée à cet utilisateur" },
      { status: 400 }
    );
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Check today's slots
    const todaySlots = await prisma.accessSlot.findMany({
      where: {
        churchId,
        date: {
          gte: today,
          lte: todayEnd,
        },
        status: { in: ["SCHEDULED", "ACTIVE"] },
      },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    const hasAccess = todaySlots.length > 0;

    // Get next upcoming slot
    const nextSlot = await prisma.accessSlot.findFirst({
      where: {
        churchId,
        date: { gt: todayEnd },
        status: "SCHEDULED",
      },
      orderBy: { date: "asc" },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    // Get all upcoming slots
    const slots = await prisma.accessSlot.findMany({
      where: {
        churchId,
        date: { gte: today },
        status: { in: ["SCHEDULED", "ACTIVE"] },
      },
      orderBy: { date: "asc" },
      take: 10,
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json({
      hasAccess,
      nextSlot: nextSlot || null,
      slots,
    });
  } catch (error) {
    console.error("Error checking church access:", error);
    return NextResponse.json({ error: "Erreur lors de la vérification" }, { status: 500 });
  }
}
