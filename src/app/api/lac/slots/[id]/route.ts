import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/slots/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const slot = await prisma.accessSlot.findUnique({
    where: { id: params.id },
    include: {
      church: true,
    },
  });

  if (!slot) {
    return NextResponse.json({ error: "Créneau non trouvé" }, { status: 404 });
  }

  return NextResponse.json(slot);
}

// PUT /api/lac/slots/[id]
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
    const { status, maxParticipants, notes } = body;

    const existing = await prisma.accessSlot.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Créneau non trouvé" }, { status: 404 });
    }

    const slot = await prisma.accessSlot.update({
      where: { id: params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(maxParticipants !== undefined && { maxParticipants }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json(slot);
  } catch (error) {
    console.error("Error updating slot:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

// DELETE /api/lac/slots/[id] — Set status to CANCELLED
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
    const existing = await prisma.accessSlot.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: "Créneau non trouvé" }, { status: 404 });
    }

    const slot = await prisma.accessSlot.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
      include: {
        church: {
          select: { id: true, name: true, slug: true, color: true },
        },
      },
    });

    return NextResponse.json({ message: "Créneau annulé", slot });
  } catch (error) {
    console.error("Error cancelling slot:", error);
    return NextResponse.json({ error: "Erreur lors de l'annulation" }, { status: 500 });
  }
}
