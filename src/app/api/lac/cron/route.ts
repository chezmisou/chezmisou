import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/lac/cron — Update slot statuses
// Past SCHEDULED → COMPLETED, today's SCHEDULED → ACTIVE
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    // Mark past SCHEDULED slots as COMPLETED
    const completed = await prisma.accessSlot.updateMany({
      where: {
        status: "SCHEDULED",
        date: { lt: today },
      },
      data: { status: "COMPLETED" },
    });

    // Mark today's SCHEDULED slots as ACTIVE
    const activated = await prisma.accessSlot.updateMany({
      where: {
        status: "SCHEDULED",
        date: {
          gte: today,
          lte: todayEnd,
        },
      },
      data: { status: "ACTIVE" },
    });

    return NextResponse.json({
      message: "Mise à jour des statuts terminée",
      completed: completed.count,
      activated: activated.count,
    });
  } catch (error) {
    console.error("Error running cron:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour des statuts" }, { status: 500 });
  }
}
