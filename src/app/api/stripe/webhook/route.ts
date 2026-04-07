import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM } from "@/lib/resend";
import { render } from "@react-email/render";
import { OrderConfirmationEpicerie } from "@/lib/emails/order-confirmation-epicerie";
import { AdminNewOrder } from "@/lib/emails/admin-new-order";
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
      console.error("[webhook] handleCheckoutCompleted error:", err);
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
  if (metadata.order_type !== "epicerie") {
    console.log("[webhook] Not an epicerie order, skipping");
    return;
  }

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

  const shippingCents = subtotalCents >= 6000 ? 0 : 690;
  const totalCents = subtotalCents + shippingCents;

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
      discountAmount: 0,
      total: totalEuros,
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
  const adminEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails?.length) {
    try {
      const adminHtml = await render(
        AdminNewOrder({
          orderNumber,
          orderId: order.id,
          customerName: `${firstName} ${lastName}`,
          customerEmail: email,
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
        to: adminEmails,
        subject: `Nouvelle commande épicerie #${orderNumber}`,
        html: adminHtml,
      });
      console.log("[webhook] Admin notification sent to:", adminEmails);
    } catch (err) {
      console.error("[webhook] Failed to send admin email:", err);
    }
  }

  console.log("[webhook] Done processing session:", session.id);
}
