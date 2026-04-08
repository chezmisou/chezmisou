import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const menu = await prisma.lacMenu.findUnique({
    where: { id },
    select: { serviceDate: true, orderDeadline: true, isPublished: true },
  });

  if (!menu || !menu.isPublished) {
    return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    serviceDate: menu.serviceDate.toISOString(),
    orderDeadline: menu.orderDeadline.toISOString(),
  });
}
