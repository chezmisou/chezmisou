import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMatchingSundays } from "@/lib/lac/recurrence";

// POST /api/lac/recurrence/generate — Generate AccessSlots from active recurrence rules
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
    const body = await req.json().catch(() => ({}));
    const months = body.months || 3;

    const rules = await prisma.recurrenceRule.findMany({
      where: { isActive: true },
      include: { church: true },
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let created = 0;
    let skipped = 0;

    for (const rule of rules) {
      const sundays = getMatchingSundays(
        rule.frequency,
        rule.startDate,
        rule.endDate,
        now,
        months
      );

      for (const sunday of sundays) {
        // Normalize to midnight UTC for consistent comparison
        const slotDate = new Date(
          Date.UTC(sunday.getFullYear(), sunday.getMonth(), sunday.getDate())
        );

        try {
          await prisma.accessSlot.create({
            data: {
              churchId: rule.churchId,
              date: slotDate,
            },
          });
          created++;
        } catch (error: any) {
          // Unique constraint violation — slot already exists, skip
          if (error.code === "P2002") {
            skipped++;
          } else {
            throw error;
          }
        }
      }
    }

    return NextResponse.json({
      message: `Génération terminée: ${created} créneaux créés, ${skipped} ignorés (déjà existants)`,
      created,
      skipped,
      rulesProcessed: rules.length,
    });
  } catch (error) {
    console.error("Error generating slots:", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
