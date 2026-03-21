import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/recurrence — List recurrence rules
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const churchId = searchParams.get("churchId");
  const isActive = searchParams.get("isActive");

  const where: any = {};
  if (churchId) where.churchId = churchId;
  if (isActive !== null && isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true";
  }

  const rules = await prisma.recurrenceRule.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      church: {
        select: { id: true, name: true, slug: true, color: true },
      },
    },
  });

  return NextResponse.json(rules);
}

// POST /api/lac/recurrence — Create a recurrence rule
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
    const body = await req.json();
    const { churchId, frequency, startDate, endDate } = body;

    if (!churchId || !frequency || !startDate) {
      return NextResponse.json(
        { error: "Les champs churchId, frequency et startDate sont requis" },
        { status: 400 }
      );
    }

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
    }

    const validFrequencies = [
      "WEEKLY", "BIWEEKLY",
      "MONTHLY_FIRST", "MONTHLY_SECOND", "MONTHLY_THIRD",
      "MONTHLY_FOURTH", "MONTHLY_LAST",
    ];
    if (!validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: "Fréquence invalide" }, { status: 400 });
    }

    const rule = await prisma.recurrenceRule.create({
      data: {
        churchId,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating recurrence rule:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
