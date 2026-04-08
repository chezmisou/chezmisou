import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ValidateBody {
  code: string;
  type: "epicerie" | "lac";
  items: Array<{
    variantId?: string;
    lacDishId?: string;
    productId?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  customerEmail?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: ValidateBody = await req.json();
    const { code, type, items, subtotal, customerEmail } = body;

    if (!code || !type) {
      return NextResponse.json(
        { valid: false, error: "Code et type requis" },
        { status: 400 }
      );
    }

    // 1. Fetch promo code
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
      include: { products: true },
    });

    if (!promo) {
      return NextResponse.json({ valid: false, error: "Code promo invalide" });
    }

    // 2. Check isActive
    if (!promo.isActive) {
      return NextResponse.json({ valid: false, error: "Ce code promo est désactivé" });
    }

    // 3. Check dates
    if (promo.validFrom && new Date() < promo.validFrom) {
      return NextResponse.json({ valid: false, error: "Ce code promo n'est pas encore valide" });
    }
    if (promo.validUntil && new Date() > promo.validUntil) {
      return NextResponse.json({ valid: false, error: "Ce code promo a expiré" });
    }

    // 4. Check appliesTo
    if (promo.appliesTo !== "all") {
      if (promo.appliesTo === "specific_products" && type !== "epicerie") {
        return NextResponse.json({
          valid: false,
          error: "Ce code ne s'applique qu'à des produits de l'épicerie",
        });
      }
      if (promo.appliesTo === "epicerie" && type !== "epicerie") {
        return NextResponse.json({
          valid: false,
          error: "Ce code promo ne s'applique qu'à l'épicerie",
        });
      }
      if (promo.appliesTo === "lac" && type !== "lac") {
        return NextResponse.json({
          valid: false,
          error: "Ce code promo ne s'applique qu'au menu LAC",
        });
      }
    }

    // 5. Check specific_products
    if (promo.appliesTo === "specific_products") {
      const promoProductIds = new Set(promo.products.map((p) => p.productId));
      const hasMatchingProduct = items.some(
        (item) => item.productId && promoProductIds.has(item.productId)
      );
      if (!hasMatchingProduct) {
        return NextResponse.json({
          valid: false,
          error: "Aucun produit de votre panier n'est éligible à ce code promo",
        });
      }
    }

    // 6. Check minOrderAmount
    if (promo.minOrderAmount && subtotal < Number(promo.minOrderAmount)) {
      const min = Number(promo.minOrderAmount).toFixed(2).replace(".", ",");
      return NextResponse.json({
        valid: false,
        error: `Commande minimum de ${min} € requise pour ce code`,
      });
    }

    // 7. Check usageLimit
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: "Ce code promo a atteint son nombre maximal d'utilisations",
      });
    }

    // 8. Check usageLimitPerCustomer
    if (promo.usageLimitPerCustomer && customerEmail) {
      const customerRedemptions = await prisma.promoCodeRedemption.count({
        where: {
          promoCodeId: promo.id,
          OR: [
            { guestEmail: customerEmail.toLowerCase() },
            { customer: { email: customerEmail.toLowerCase() } },
          ],
        },
      });
      if (customerRedemptions >= promo.usageLimitPerCustomer) {
        return NextResponse.json({
          valid: false,
          error: "Vous avez déjà utilisé ce code le nombre maximal de fois",
        });
      }
    }

    // 9. Calculate discount
    let discountAmount: number;
    if (promo.discountType === "percentage") {
      discountAmount = subtotal * (Number(promo.discountValue) / 100);
    } else {
      discountAmount = Math.min(Number(promo.discountValue), subtotal);
    }
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: promo.code,
      promoCodeId: promo.id,
      discountAmount,
    });
  } catch (err) {
    console.error("[promos/validate] Erreur:", err);
    return NextResponse.json(
      { valid: false, error: "Erreur lors de la validation du code" },
      { status: 500 }
    );
  }
}
