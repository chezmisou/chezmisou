import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutItem {
  variantId: string;
  quantity: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  notes?: string;
  promoCodeId?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, customer, address, notes, promoCodeId } = body;

    // --- Validation ---
    if (!items?.length) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }
    if (!customer?.email || !customer.firstName || !customer.lastName) {
      return NextResponse.json(
        { error: "Les coordonnées client sont incomplètes" },
        { status: 400 }
      );
    }
    if (!address?.line1 || !address.postalCode || !address.city) {
      return NextResponse.json(
        { error: "L'adresse de livraison est incomplète" },
        { status: 400 }
      );
    }

    // --- Re-validate variants from database (NEVER trust client prices) ---
    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    const variantMap = new Map(variants.map((v) => [v.id, v]));

    for (const item of items) {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        return NextResponse.json(
          { error: `Variante introuvable : ${item.variantId}` },
          { status: 400 }
        );
      }
      if (variant.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour « ${variant.product.name} — ${variant.name} » (${variant.stock} restant${variant.stock > 1 ? "s" : ""})`,
          },
          { status: 409 }
        );
      }
    }

    // --- Build Stripe line items from DB data ---
    const lineItems = items.map((item) => {
      const variant = variantMap.get(item.variantId)!;
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${variant.product.name} — ${variant.name}`,
            metadata: { variantId: variant.id },
          },
          unit_amount: Math.round(Number(variant.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    // --- Read dynamic settings ---
    const shippingCostEuros = await getNumberSetting(
      SETTING_KEYS.SHIPPING_COST_FRANCE.key,
      SETTING_KEYS.SHIPPING_COST_FRANCE.default
    );
    const freeShippingThreshold = await getNumberSetting(
      SETTING_KEYS.FREE_SHIPPING_THRESHOLD.key,
      SETTING_KEYS.FREE_SHIPPING_THRESHOLD.default
    );

    // --- Calculate subtotal (in cents) from DB prices ---
    const subtotalCents = items.reduce((sum, item) => {
      const variant = variantMap.get(item.variantId)!;
      return sum + Math.round(Number(variant.price) * 100) * item.quantity;
    }, 0);
    const subtotalEuros = subtotalCents / 100;

    const shippingCostCents = subtotalEuros >= freeShippingThreshold ? 0 : Math.round(shippingCostEuros * 100);

    // --- Promo code server-side re-validation ---
    let discountAmountCents = 0;
    let validatedPromoCode: { id: string; code: string } | null = null;

    if (promoCodeId) {
      const promo = await prisma.promoCode.findUnique({
        where: { id: promoCodeId },
        include: { products: true },
      });

      if (!promo || !promo.isActive) {
        return NextResponse.json({ error: "Code promo invalide ou désactivé" }, { status: 400 });
      }
      if (promo.validFrom && new Date() < promo.validFrom) {
        return NextResponse.json({ error: "Ce code promo n'est pas encore valide" }, { status: 400 });
      }
      if (promo.validUntil && new Date() > promo.validUntil) {
        return NextResponse.json({ error: "Ce code promo a expiré" }, { status: 400 });
      }
      if (promo.appliesTo !== "all" && promo.appliesTo !== "epicerie" && promo.appliesTo !== "specific_products") {
        return NextResponse.json({ error: "Ce code promo ne s'applique pas à l'épicerie" }, { status: 400 });
      }
      if (promo.appliesTo === "specific_products") {
        const promoProductIds = new Set(promo.products.map((p) => p.productId));
        const hasMatchingProduct = items.some((item) => {
          const variant = variantMap.get(item.variantId);
          return variant && promoProductIds.has(variant.productId);
        });
        if (!hasMatchingProduct) {
          return NextResponse.json({ error: "Aucun produit de votre panier n'est éligible à ce code promo" }, { status: 400 });
        }
      }
      if (promo.minOrderAmount && subtotalEuros < Number(promo.minOrderAmount)) {
        return NextResponse.json(
          { error: `Commande minimum de ${Number(promo.minOrderAmount).toFixed(2)} € requise pour ce code` },
          { status: 400 }
        );
      }
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return NextResponse.json({ error: "Ce code promo a atteint son nombre maximal d'utilisations" }, { status: 400 });
      }
      if (promo.usageLimitPerCustomer && customer.email) {
        const customerRedemptions = await prisma.promoCodeRedemption.count({
          where: {
            promoCodeId: promo.id,
            OR: [{ guestEmail: customer.email.toLowerCase() }, { customer: { email: customer.email.toLowerCase() } }],
          },
        });
        if (customerRedemptions >= promo.usageLimitPerCustomer) {
          return NextResponse.json({ error: "Vous avez déjà utilisé ce code promo le nombre maximal de fois" }, { status: 400 });
        }
      }

      if (promo.discountType === "percentage") {
        discountAmountCents = Math.round(subtotalCents * (Number(promo.discountValue) / 100));
      } else {
        discountAmountCents = Math.min(Math.round(Number(promo.discountValue) * 100), subtotalCents);
      }

      validatedPromoCode = { id: promo.id, code: promo.code };
    }

    // --- Shipping options ---
    const shippingOptions =
      shippingCostCents === 0
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: { amount: 0, currency: "eur" },
                display_name: "Livraison offerte",
                delivery_estimate: {
                  minimum: { unit: "business_day" as const, value: 3 },
                  maximum: { unit: "business_day" as const, value: 7 },
                },
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: { amount: shippingCostCents, currency: "eur" },
                display_name: "Livraison standard",
                delivery_estimate: {
                  minimum: { unit: "business_day" as const, value: 3 },
                  maximum: { unit: "business_day" as const, value: 7 },
                },
              },
            },
          ];

    // --- Items JSON for webhook reconstruction ---
    const itemsJson = JSON.stringify(
      items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
    );

    // --- Create Stripe Coupon if promo applied ---
    const discounts: { coupon: string }[] = [];
    if (validatedPromoCode && discountAmountCents > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: discountAmountCents,
        currency: "eur",
        duration: "once",
        name: `Code ${validatedPromoCode.code}`,
      });
      discounts.push({ coupon: coupon.id });
    }

    // --- Create Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_options: shippingOptions,
      ...(discounts.length > 0 ? { discounts } : {}),
      customer_email: customer.email,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/epicerie/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/epicerie`,
      locale: "fr",
      metadata: {
        order_type: "epicerie",
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        customer_phone: customer.phone || "",
        address_line1: address.line1,
        address_line2: address.line2 || "",
        address_postal_code: address.postalCode,
        address_city: address.city,
        address_country: address.country || "FR",
        notes: notes || "",
        items_json: itemsJson,
        ...(validatedPromoCode
          ? {
              promo_code_id: validatedPromoCode.id,
              discount_amount: (discountAmountCents / 100).toFixed(2),
            }
          : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout/epicerie] Erreur:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du paiement" },
      { status: 500 }
    );
  }
}
