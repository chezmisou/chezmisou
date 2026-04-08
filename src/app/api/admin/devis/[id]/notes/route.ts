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
    const body = await req.json();
    const { adminNotes } = body;

    const quote = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json(
        { error: "Demande introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { adminNotes: adminNotes ?? null },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating admin notes:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des notes" },
      { status: 500 }
    );
  }
}
