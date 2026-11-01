import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { activeLacOrderWhere } from "@/lib/orders/lac";
import { getLacPickupSettings } from "@/lib/lac-delivery-server";
import { num } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/**
 * LAC : prochain menu publié, avec les quantités restantes par plat,
 * les églises de retrait et la grille de livraison.
 */
export async function GET() {
  const now = new Date();
  const [menu, pickup] = await Promise.all([
    prisma.lacMenu.findFirst({
      where: { isPublished: true, serviceDate: { gte: now } },
      include: { dishes: { orderBy: { position: "asc" } } },
      orderBy: { serviceDate: "asc" },
    }),
    getLacPickupSettings(),
  ]);

  let ordered = new Map<string, number>();
  if (menu) {
    const sums = await prisma.orderItem.groupBy({
      by: ["itemId"],
      where: {
        itemType: "lac_dish",
        itemId: { in: menu.dishes.map((d) => d.id) },
        order: { lacMenuId: menu.id, ...activeLacOrderWhere },
      },
      _sum: { quantity: true },
    });
    ordered = new Map(sums.map((s) => [s.itemId, s._sum.quantity ?? 0]));
  }

  return NextResponse.json({
    menu: menu
      ? {
          id: menu.id,
          serviceDate: menu.serviceDate.toISOString(),
          orderDeadline: menu.orderDeadline.toISOString(),
          info: menu.deliveryZoneText,
          isOpen: now <= menu.orderDeadline,
          dishes: menu.dishes.map((d) => ({
            id: d.id,
            name: d.name,
            description: d.description,
            photoUrl: d.photoUrl,
            price: num(d.price),
            remaining:
              d.maxQuantity != null
                ? Math.max(0, d.maxQuantity - (ordered.get(d.id) ?? 0))
                : null,
          })),
        }
      : null,
    churches: pickup.churches,
    tiers: pickup.tiers,
  });
}
