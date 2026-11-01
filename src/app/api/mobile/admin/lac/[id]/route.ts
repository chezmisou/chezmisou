import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { activeLacOrderWhere } from "@/lib/orders/lac";
import { num, orderInclude, serializeOrder } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/**
 * Préparation d'un dimanche : portions par plat, commandes regroupées par
 * église, puis livraisons. La publication passe par PATCH /api/admin/lac/[id].
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;

  const menu = await prisma.lacMenu.findUnique({
    where: { id },
    include: { dishes: { orderBy: { position: "asc" } } },
  });
  if (!menu) return NextResponse.json({ error: "Menu introuvable" }, { status: 404 });

  const orders = await prisma.order.findMany({
    where: { lacMenuId: id, ...activeLacOrderWhere },
    orderBy: { createdAt: "asc" },
    include: orderInclude,
  });

  const totals = new Map<string, number>(menu.dishes.map((d) => [d.id, 0]));
  for (const o of orders) {
    for (const it of o.items) {
      if (it.itemType === "lac_dish" && totals.has(it.itemId)) {
        totals.set(it.itemId, (totals.get(it.itemId) ?? 0) + it.quantity);
      }
    }
  }

  const serialized = orders.map(serializeOrder);
  const groups = new Map<string, typeof serialized>();
  for (const o of serialized.filter((o) => o.deliveryMethod === "pickup")) {
    const key = o.pickupLocation?.split(" — ")[0] || "Retrait sur place";
    groups.set(key, [...(groups.get(key) ?? []), o]);
  }

  return NextResponse.json({
    menu: {
      id: menu.id,
      serviceDate: menu.serviceDate.toISOString(),
      orderDeadline: menu.orderDeadline.toISOString(),
      isPublished: menu.isPublished,
      info: menu.deliveryZoneText,
    },
    dishes: menu.dishes.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      photoUrl: d.photoUrl,
      price: num(d.price),
      maxQuantity: d.maxQuantity,
      ordered: totals.get(d.id) ?? 0,
    })),
    revenue: serialized.reduce((s, o) => s + o.total, 0),
    pickupGroups: [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, "fr"))
      .map(([church, list]) => ({ church, orders: list })),
    deliveries: serialized
      .filter((o) => o.deliveryMethod === "local_delivery")
      .sort((a, b) => (a.deliveryDistanceKm ?? 0) - (b.deliveryDistanceKm ?? 0)),
  });
}
