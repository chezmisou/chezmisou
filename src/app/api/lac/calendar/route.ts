import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/calendar?month=YYYY-MM — Get all slots for a month with church data
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month");

  if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
    return NextResponse.json(
      { error: "Le paramètre month est requis au format YYYY-MM" },
      { status: 400 }
    );
  }

  const [year, month] = monthParam.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const slots = await prisma.accessSlot.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "asc" },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          contactName: true,
          contactPhone: true,
          logoUrl: true,
        },
      },
    },
  });

  return NextResponse.json({ month: monthParam, slots });
}
