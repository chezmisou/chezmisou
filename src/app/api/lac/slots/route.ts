import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSunday } from "@/lib/lac/recurrence";

// GET /api/lac/slots — List slots with filters
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const churchId = searchParams.get("churchId");
  const status = searchParams.get("status");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const where: any = {};

  if (churchId) {
    where.churchId = churchId;
  }

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }

  const [slots, total] = await Promise.all([
    prisma.accessSlot.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    }),
    prisma.accessSlot.count({ where }),
  ]);

  return NextResponse.json({ slots, total, page, limit });
}

// POST /api/lac/slots — Create a slot
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
    const { churchId, date, maxParticipants, notes } = body;

    if (!churchId || !date) {
      return NextResponse.json(
        { error: "Les champs churchId et date sont requis" },
        { status: 400 }
      );
    }

    const slotDate = new Date(date);
    if (!isSunday(slotDate)) {
      return NextResponse.json(
        { error: "La date doit être un dimanche" },
        { status: 400 }
      );
    }

    const church = await prisma.church.findUnique({ where: { id: churchId } });
    if (!church) {
      return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
    }

    // Check for existing slot with same church and date
    const existing = await prisma.accessSlot.findUnique({
      where: { churchId_date: { churchId, date: slotDate } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Un créneau existe déjà pour cette église à cette date" },
        { status: 409 }
      );
    }

    const slot = await prisma.accessSlot.create({
      data: {
        churchId,
        date: slotDate,
        maxParticipants: maxParticipants || null,
        notes: notes || null,
      },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json(slot, { status: 201 });
  } catch (error) {
    console.error("Error creating slot:", error);
    return NextResponse.json({ error: "Erreur lors de la création du créneau" }, { status: 500 });
  }
}
