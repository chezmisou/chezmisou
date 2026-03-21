import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/churches — List churches with search/filter
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const isActive = searchParams.get("isActive");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { contactName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isActive !== null && isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true";
  }

  const [churches, total] = await Promise.all([
    prisma.church.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { accessSlots: true, users: true },
        },
      },
    }),
    prisma.church.count({ where }),
  ]);

  return NextResponse.json({ churches, total, page, limit });
}

// POST /api/lac/churches — Create a church
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
    const { name, slug, contactName, contactEmail, contactPhone, address, city, logoUrl, color } = body;

    if (!name || !slug || !contactName || !contactEmail) {
      return NextResponse.json(
        { error: "Les champs name, slug, contactName et contactEmail sont requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.church.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
    }

    const church = await prisma.church.create({
      data: {
        name,
        slug,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        address: address || null,
        city: city || null,
        logoUrl: logoUrl || null,
        color: color || "#6366f1",
      },
    });

    return NextResponse.json(church, { status: 201 });
  } catch (error) {
    console.error("Error creating church:", error);
    return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
  }
}
