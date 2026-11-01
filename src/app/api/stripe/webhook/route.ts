import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM } from "@/lib/resend";
import { render } from "@react-email/render";
import { OrderConfirmationEpicerie } from "@/lib/emails/order-confirmation-epicerie";
import { createLacOrder } from "@/lib/orders/lac";
import { sendAdminNotification } from "@/lib/orders/admin-notification";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Missing signature or secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await handleCheckoutCompleted(session);
    } catch (err) {
      // Renvoyer une erreur pour que Stripe réessaie automatiquement.
      // Sans ça, un paiement encaissé pourrait ne jamais créer de commande.
      // Les réessais sont sans danger : la commande existante est détectée
      // via stripeSessionId et n'est pas créée deux fois.
      console.error("[webhook] handleCheckoutCompleted error:", err);
      return new NextResponse("Webhook handler failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("[webhook] Processing session:", session.id);

  // 1. Idempotency check
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    console.log("[webhook] Session already processed:", session.id);
    return;
  }

  const metadata = session.metadata || {};
  const orderType = metadata.order_type;

  if (orderType === "epicerie") {
    await handleEpicerieOrder(session, metadata);
  } else if (orderType === "lac") {
    await handleLacOrder(session, metadata);
  } else {
    console.log("[webhook] Unknown order type:", orderType);
  }
}

// ─── Epicerie order (existing Lot 2b logic, unchanged) ────────────────────────

async function handleEpicerieOrder(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  // 2. Parse items from metadata
  let items: { variantId: string; quantity: number }[];
  try {
    items = JSON.parse(metadata.items_json || "[]");
  } catch {
    console.error("[webhook] Failed to parse items_json");
    return;
  }

  if (!items.length) {
    console.error("[webhook] No items in order");
    return;
  }

  // 3. Re-fetch variants from DB
  const variantIds = items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // 4. Upsert CustomerProfile
  const email =
    session.customer_email || `${metadata.customer_first_name}@unknown.com`;
  const firstName = metadata.customer_first_name || "";
  const lastName = metadata.customer_last_name || "";
  const phone = metadata.customer_phone || "";

  const customer = await prisma.customerProfile.upsert({
    where: { email },
    create: { email, firstName, lastName, phone: phone || null },
    update: { firstName, lastName, phone: phone || null },
  });
  console.log("[webhook] Customer profile:", customer.id);

  // 5. Create Address
  const address = await prisma.address.create({
    data: {
      customerProfileId: customer.id,
      line1: metadata.address_line1 || "",
      line2: metadata.address_line2 || null,
      postalCode: metadata.address_postal_code || "",
      city: metadata.address_city || "",
      country: metadata.address_country || "FR",
    },
  });
  console.log("[webhook] Address:", address.id);

  // 6. Calculate totals from DB prices
  const subtotalCents = items.reduce((sum, item) => {
    const variant = variantMap.get(item.variantId);
    if (!variant) return sum;
    return sum + Math.round(Number(variant.price) * 100) * item.quantity;
  }, 0);

  const shippingCostEuros = await getNumberSetting(
    SETTING_KEYS.SHIPPING_COST_FRANCE.key,
    SETTING_KEYS.SHIPPING_COST_FRANCE.default
  );
  const freeShippingThreshold = await getNumberSetting(
    SETTING_KEYS.FREE_SHIPPING_THRESHOLD.key,
    SETTING_KEYS.FREE_SHIPPING_THRESHOLD.default
  );
  const subtotalEurosCalc = subtotalCents / 100;
  const shippingCents = subtotalEurosCalc >= freeShippingThreshold ? 0 : Math.round(shippingCostEuros * 100);

  // Discount from promo code
  const promoCodeId = metadata.promo_code_id || null;
  const discountEuros = promoCodeId ? parseFloat(metadata.discount_amount || "0") : 0;
  const discountCents = Math.round(discountEuros * 100);

  const totalCents = subtotalCents + shippingCents - discountCents;

  const subtotalEuros = subtotalCents / 100;
  const shippingEuros = shippingCents / 100;
  const totalEuros = totalCents / 100;

  // 7. Build order items
  const orderItems = items
    .map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) return null;
      return {
        itemType: "product_variant",
        itemId: variant.id,
        itemNameSnapshot: `${variant.product.name} — ${variant.name}`,
        itemPriceSnapshot: Number(variant.price),
        quantity: item.quantity,
      };
    })
    .filter(
      (x): x is NonNullable<typeof x> => x !== null
    );

  // 8. Create Order
  const orderNumber = `EPI-${Date.now().toString(36).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      type: "epicerie",
      customerProfileId: customer.id,
      guestEmail: email,
      status: "paid",
      subtotal: subtotalEuros,
      shippingCost: shippingEuros,
      discountAmount: discountEuros,
      total: totalEuros,
      promoCodeId: promoCodeId || null,
      paymentProvider: "stripe",
      paymentStatus: "paid",
      stripeSessionId: session.id,
      deliveryMethod: "shipping",
      shippingAddressId: address.id,
      notes: metadata.notes || null,
      items: {
        create: orderItems,
      },
    },
  });
  console.log("[webhook] Order created:", order.id, orderNumber);

  // 8b. Create PromoCodeRedemption and increment usedCount
  if (promoCodeId && discountEuros > 0) {
    await prisma.promoCodeRedemption.create({
      data: {
        promoCodeId,
        orderId: order.id,
        customerProfileId: customer.id,
        guestEmail: email,
        discountAmount: discountEuros,
      },
    });
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
    console.log("[webhook] PromoCodeRedemption created for:", promoCodeId);
  }

  // 9. Decrement stock for each variant
  for (const item of items) {
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { decrement: item.quantity } },
    });
  }
  console.log("[webhook] Stock decremented");

  // 10. Send confirmation email to customer
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chezmisou.com";
  const emailItems = orderItems.map((oi) => ({
    name: oi.itemNameSnapshot,
    quantity: oi.quantity,
    unitPrice: oi.itemPriceSnapshot,
    total: oi.itemPriceSnapshot * oi.quantity,
  }));

  try {
    const customerHtml = await render(
      OrderConfirmationEpicerie({
        firstName,
        orderNumber,
        items: emailItems,
        subtotal: subtotalEuros,
        shippingCost: shippingEuros,
        total: totalEuros,
        address: {
          line1: metadata.address_line1 || "",
          line2: metadata.address_line2 || undefined,
          postalCode: metadata.address_postal_code || "",
          city: metadata.address_city || "",
          country: metadata.address_country || "FR",
        },
        appUrl,
      })
    );

    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: `Chez Misou — Confirmation de commande #${orderNumber}`,
      html: customerHtml,
    });
    console.log("[webhook] Confirmation email sent to:", email);
  } catch (err) {
    console.error("[webhook] Failed to send customer email:", err);
  }

  // 11. Send admin notification
  await sendAdminNotification({
    orderNumber,
    orderId: order.id,
    customerName: `${firstName} ${lastName}`,
    customerEmail: email,
    emailItems,
    subtotalEuros,
    shippingEuros,
    totalEuros,
    orderLabel: "épicerie",
    address: {
      line1: metadata.address_line1 || "",
      line2: metadata.address_line2 || undefined,
      postalCode: metadata.address_postal_code || "",
      city: metadata.address_city || "",
      country: metadata.address_country || "FR",
    },
    subject: `Nouvelle commande épicerie #${orderNumber}`,
  });

  console.log("[webhook] Done processing epicerie session:", session.id);
}

// ─── LAC order (Lot 5b) ──────────────────────────────────────────────────────

async function handleLacOrder(
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>
) {
  let items: { lacDishId: string; quantity: number }[];
  try {
    items = JSON.parse(metadata.items_json || "[]");
  } catch {
    console.error("[webhook] Failed to parse LAC items_json");
    return;
  }

  if (!items.length) {
    console.error("[webhook] No items in LAC order");
    return;
  }

  const lacMenuId = metadata.lac_menu_id;
  if (!lacMenuId) {
    console.error("[webhook] Missing lac_menu_id");
    return;
  }

  const deliveryMethod = metadata.delivery_method as
    | "pickup"
    | "local_delivery";

  await createLacOrder({
    lacMenuId,
    items,
    deliveryMethod,
    customer: {
      email:
        session.customer_email || `${metadata.customer_first_name}@unknown.com`,
      firstName: metadata.customer_first_name || "",
      lastName: metadata.customer_last_name || "",
      phone: metadata.customer_phone || "",
    },
    address:
      deliveryMethod === "local_delivery" && metadata.address_line1
        ? {
            line1: metadata.address_line1,
            line2: metadata.address_line2 || undefined,
            postalCode: metadata.address_postal_code || "",
            city: metadata.address_city || "",
          }
        : null,
    instructions: metadata.delivery_instructions || undefined,
    notes: metadata.notes || undefined,
    pickupLocation: metadata.pickup_location || null,
    // Frais réellement facturés par Stripe (calculés selon la distance au checkout)
    shippingEuros:
      session.shipping_cost?.amount_total != null
        ? session.shipping_cost.amount_total / 100
        : parseFloat(metadata.delivery_fee || "0") || 0,
    deliveryDistanceKm: metadata.delivery_distance_km
      ? parseFloat(metadata.delivery_distance_km)
      : null,
    promoCodeId: metadata.promo_code_id || null,
    discountEuros: metadata.promo_code_id
      ? parseFloat(metadata.discount_amount || "0")
      : 0,
    payment: { method: "card", stripeSessionId: session.id },
  });

  console.log("[webhook] Done processing LAC session:", session.id);
}
