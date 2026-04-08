import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const validStatuses = ["new", "in_progress", "quote_sent", "accepted", "refused"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Statut invalide" },
        { status: 400 }
      );
    }

    const quote = await prisma.quoteRequest.findUnique({ where: { id } });
    if (!quote) {
      return NextResponse.json(
        { error: "Demande introuvable" },
        { status: 404 }
      );
    }

    const updated = await prisma.quoteRequest.update({
      where: { id },
      data: { status: status as "new" | "in_progress" | "quote_sent" | "accepted" | "refused" },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating quote status:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}
