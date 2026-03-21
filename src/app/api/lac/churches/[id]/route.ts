import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/churches/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const church = await prisma.church.findUnique({
    where: { id: params.id },
    include: {
      accessSlots: {
        orderBy: { date: "asc" },
        take: 10,
      },
      recurrenceRules: true,
      _count: {
        select: { accessSlots: true, users: true },
      },
    },
  });

  if (!church) {
    return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
  }

  return NextResponse.json(church);
}

// PUT /api/lac/churches/[id]
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
    const { name, slug, contactName, contactEmail, contactPhone, address, city, logoUrl, color, isActive } = body;

    const existing = await prisma.church.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.church.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 409 });
      }
    }

    const church = await prisma.church.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(contactName !== undefined && { contactName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(church);
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/lac/churches/[id] — Soft delete (set isActive=false)
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
    const existing = await prisma.church.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Église non trouvée" }, { status: 404 });
    }

    const church = await prisma.church.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Église désactivée", church });
  } catch (error) {
    console.error("Error deleting church:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
