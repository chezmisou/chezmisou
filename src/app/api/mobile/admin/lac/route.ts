import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { activeLacOrderWhere } from "@/lib/orders/lac";

export const dynamic = "force-dynamic";

/** Menus LAC (les plus récents d'abord) avec le nombre de commandes. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const menus = await prisma.lacMenu.findMany({
    orderBy: { serviceDate: "desc" },
    take: 30,
    include: { _count: { select: { dishes: true } } },
  });
  const counts = await prisma.order.groupBy({
    by: ["lacMenuId"],
    where: { type: "lac", lacMenuId: { in: menus.map((m) => m.id) }, ...activeLacOrderWhere },
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.lacMenuId, c._count]));

  return NextResponse.json({
    menus: menus.map((m) => ({
      id: m.id,
      serviceDate: m.serviceDate.toISOString(),
      orderDeadline: m.orderDeadline.toISOString(),
      isPublished: m.isPublished,
      dishCount: m._count.dishes,
      orderCount: countMap.get(m.id) ?? 0,
    })),
  });
}
