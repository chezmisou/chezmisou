import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/lac/settings — Get LAC config
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const role = (session.user as any).role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Get or create default config
  let config = await prisma.lacConfig.findFirst();
  if (!config) {
    config = await prisma.lacConfig.create({ data: {} });
  }

  return NextResponse.json(config);
}

// PUT /api/lac/settings — Update LAC config
export async function PUT(req: NextRequest) {
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
    const {
      maxChurchesPerSunday,
      defaultStartTime,
      defaultEndTime,
      reminderEmailsEnabled,
      reminderDaysBefore,
    } = body;

    // Get or create config
    let config = await prisma.lacConfig.findFirst();
    if (!config) {
      config = await prisma.lacConfig.create({ data: {} });
    }

    const updated = await prisma.lacConfig.update({
      where: { id: config.id },
      data: {
        ...(maxChurchesPerSunday !== undefined && { maxChurchesPerSunday }),
        ...(defaultStartTime !== undefined && { defaultStartTime }),
        ...(defaultEndTime !== undefined && { defaultEndTime }),
        ...(reminderEmailsEnabled !== undefined && { reminderEmailsEnabled }),
        ...(reminderDaysBefore !== undefined && { reminderDaysBefore }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating LAC config:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}
