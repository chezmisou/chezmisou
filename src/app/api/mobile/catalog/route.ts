import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";
import { num } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Épicerie : produits actifs pour l'app mobile. */
export async function GET() {
  const [products, shippingCost, freeThreshold] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { orderBy: { position: "asc" } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    getNumberSetting(SETTING_KEYS.SHIPPING_COST_FRANCE.key, SETTING_KEYS.SHIPPING_COST_FRANCE.default),
    getNumberSetting(SETTING_KEYS.FREE_SHIPPING_THRESHOLD.key, SETTING_KEYS.FREE_SHIPPING_THRESHOLD.default),
  ]);

  return NextResponse.json({
    shippingCost,
    freeThreshold,
    products: products.map((p) => {
      const prices = p.variants.map((v) => num(v.price));
      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        isFeatured: p.isFeatured,
        imageUrl: p.images[0]?.url ?? null,
        fromPrice: prices.length ? Math.min(...prices) : num(p.basePrice),
        inStock: p.variants.some((v) => v.stock > 0),
      };
    }),
  });
}
