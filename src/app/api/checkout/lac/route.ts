import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutItem {
  lacDishId: string;
  quantity: number;
}

interface CheckoutBody {
  lacMenuId: string;
  items: CheckoutItem[];
  deliveryMethod: "pickup" | "local_delivery";
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
  } | null;
  instructions?: string;
  notes?: string;
  promoCodeId?: string;
}

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();
    const { lacMenuId, items, deliveryMethod, customer, address, instructions, notes, promoCodeId } = body;

    // --- Validation ---
    if (!lacMenuId) {
      return NextResponse.json(
        { error: "Menu non spécifié" },
        { status: 400 }
      );
    }
    if (!items?.length) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }
    if (!customer?.email || !customer.firstName || !customer.lastName || !customer.phone) {
      return NextResponse.json(
        { error: "Les coordonnées client sont incomplètes" },
        { status: 400 }
      );
    }
    if (deliveryMethod === "local_delivery") {
      if (!address?.line1 || !address.postalCode || !address.city) {
        return NextResponse.json(
          { error: "L'adresse de livraison est incomplète" },
          { status: 400 }
        );
      }
    }

    // --- Re-fetch menu from database ---
    const menu = await prisma.lacMenu.findUnique({
      where: { id: lacMenuId },
      include: { dishes: true },
    });

    if (!menu || !menu.isPublished) {
      return NextResponse.json(
        { error: "Menu introuvable ou non publié" },
        { status: 400 }
      );
    }

    // --- Check deadline ---
    if (new Date() > menu.orderDeadline) {
      return NextResponse.json(
        { error: "Les commandes sont fermées pour ce menu" },
        { status: 409 }
      );
    }

    // --- Validate all dishes belong to this menu ---
    const dishMap = new Map(menu.dishes.map((d) => [d.id, d]));
    for (const item of items) {
      if (!dishMap.has(item.lacDishId)) {
        return NextResponse.json(
          { error: `Plat introuvable dans ce menu : ${item.lacDishId}` },
          { status: 400 }
        );
      }
    }

    // --- Check maxQuantity constraints ---
    for (const item of items) {
      const dish = dishMap.get(item.lacDishId)!;
      if (dish.maxQuantity != null) {
        // Count existing paid orders for this dish
        const paidQuantity = await prisma.orderItem.aggregate({
          where: {
            itemType: "lac_dish",
            itemId: dish.id,
            order: {
              lacMenuId: menu.id,
              paymentStatus: "paid",
            },
          },
          _sum: { quantity: true },
        });
        const alreadyOrdered = paidQuantity._sum.quantity || 0;
        if (alreadyOrdered + item.quantity > dish.maxQuantity) {
          return NextResponse.json(
            {
              error: `Quantité maximale dépassée pour « ${dish.name} » (${dish.maxQuantity - alreadyOrdered} restante${dish.maxQuantity - alreadyOrdered > 1 ? "s" : ""})`,
            },
            { status: 409 }
          );
        }
      }
    }

    // --- Build Stripe line items from DB prices ---
    const formattedDate = formatDateFr(menu.serviceDate);
    const lineItems = items.map((item) => {
      const dish = dishMap.get(item.lacDishId)!;
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${dish.name} — ${formattedDate}`,
            metadata: { lacDishId: dish.id },
          },
          unit_amount: Math.round(Number(dish.price) * 100),
        },
        quantity: item.quantity,
      };
    });

    // --- Read dynamic settings ---
    const lacDeliveryFee = await getNumberSetting(
      SETTING_KEYS.LAC_DELIVERY_FEE.key,
      SETTING_KEYS.LAC_DELIVERY_FEE.default
    );
    const deliveryFeeCents = Math.round(lacDeliveryFee * 100);

    // --- Calculate subtotal ---
    const subtotalCents = lineItems.reduce(
      (sum, li) => sum + li.price_data.unit_amount * li.quantity,
      0
    );
    const subtotalEuros = subtotalCents / 100;

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
      if (promo.appliesTo !== "all" && promo.appliesTo !== "lac") {
        return NextResponse.json({ error: "Ce code promo ne s'applique pas au menu LAC" }, { status: 400 });
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
      deliveryMethod === "local_delivery"
        ? [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: { amount: deliveryFeeCents, currency: "eur" },
                display_name: "Livraison locale",
              },
            },
          ]
        : [
            {
              shipping_rate_data: {
                type: "fixed_amount" as const,
                fixed_amount: { amount: 0, currency: "eur" },
                display_name: "Retrait sur place",
              },
            },
          ];

    // --- Items JSON for webhook reconstruction ---
    const itemsJson = JSON.stringify(
      items.map((i) => ({ lacDishId: i.lacDishId, quantity: i.quantity }))
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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/lac/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/lac`,
      locale: "fr",
      metadata: {
        order_type: "lac",
        lac_menu_id: lacMenuId,
        delivery_method: deliveryMethod,
        customer_first_name: customer.firstName,
        customer_last_name: customer.lastName,
        customer_phone: customer.phone,
        address_line1: address?.line1 || "",
        address_line2: address?.line2 || "",
        address_postal_code: address?.postalCode || "",
        address_city: address?.city || "",
        delivery_instructions: instructions || "",
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
    console.error("[checkout/lac] Erreur:", err);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du paiement" },
      { status: 500 }
    );
  }
}
