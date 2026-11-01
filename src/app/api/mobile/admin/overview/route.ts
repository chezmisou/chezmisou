import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { activeLacOrderWhere } from "@/lib/orders/lac";
import { num, orderInclude, serializeOrder } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Tableau de bord admin de l'app : chiffres clés et dernières commandes. */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [toHandle, monthAgg, newQuotes, nextMenu, recent] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["new", "paid", "preparing"] } } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, ...activeLacOrderWhere },
      _sum: { total: true },
      _count: true,
    }),
    prisma.quoteRequest.count({ where: { status: "new" } }),
    prisma.lacMenu.findFirst({
      where: { serviceDate: { gte: now } },
      orderBy: { serviceDate: "asc" },
      select: { id: true, serviceDate: true, orderDeadline: true, isPublished: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: orderInclude,
    }),
  ]);

  let nextLac = null;
  if (nextMenu) {
    const [orderCount, portions] = await Promise.all([
      prisma.order.count({ where: { lacMenuId: nextMenu.id, ...activeLacOrderWhere } }),
      prisma.orderItem.aggregate({
        where: { itemType: "lac_dish", order: { lacMenuId: nextMenu.id, ...activeLacOrderWhere } },
        _sum: { quantity: true },
      }),
    ]);
    nextLac = {
      id: nextMenu.id,
      serviceDate: nextMenu.serviceDate.toISOString(),
      orderDeadline: nextMenu.orderDeadline.toISOString(),
      isPublished: nextMenu.isPublished,
      orderCount,
      portions: portions._sum.quantity ?? 0,
    };
  }

  return NextResponse.json({
    toHandle,
    monthRevenue: num(monthAgg._sum.total),
    monthOrders: monthAgg._count,
    newQuotes,
    nextLac,
    recentOrders: recent.map(serializeOrder),
  });
}
