import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

/** Demandes de devis traiteur. Statut et notes : /api/admin/devis/[id]/status et /notes. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({
    quotes: quotes.map((q) => ({
      id: q.id,
      quoteNumber: q.quoteNumber,
      status: q.status,
      name: q.guestName,
      email: q.guestEmail,
      phone: q.guestPhone,
      eventDate: q.eventDate.toISOString(),
      eventType: q.eventType,
      nbPeople: q.nbPeople,
      eventLocation: q.eventLocation,
      selectedDishes: q.selectedDishes,
      message: q.message,
      adminNotes: q.adminNotes,
      createdAt: q.createdAt.toISOString(),
    })),
  });
}
