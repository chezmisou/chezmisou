import type { Prisma } from "@prisma/client";
import { render } from "@react-email/render";
import { prisma } from "@/lib/prisma";
import { resend, RESEND_FROM } from "@/lib/resend";
import { OrderConfirmationLac } from "@/lib/emails/order-confirmation-lac";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";
import { sendAdminNotification } from "@/lib/orders/admin-notification";

export type LacPaymentMethod = "cash" | "card";

/**
 * Commandes LAC « actives » : payées par carte, ou en espèces (à encaisser
 * à la remise) tant qu'elles ne sont pas annulées ou remboursées.
 * Sert pour la liste de production, le tableau de bord et les quantités max.
 */
export const activeLacOrderWhere: Prisma.OrderWhereInput = {
  OR: [
    { paymentStatus: "paid" },
    {
      paymentProvider: "cash",
      status: { notIn: ["cancelled", "refunded"] },
    },
  ],
};

export interface CreateLacOrderInput {
  lacMenuId: string;
  items: { lacDishId: string; quantity: number }[];
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
  promoCodeId?: string | null;
  discountEuros: number;
  payment:
    | { method: "card"; stripeSessionId: string }
    | { method: "cash" };
}

/**
 * Crée une commande LAC en base, enregistre le code promo et envoie les
 * emails (client + admin). Utilisé par le webhook Stripe (carte) et par
 * le checkout direct (espèces).
 */
export async function createLacOrder(input: CreateLacOrderInput) {
  const {
    lacMenuId,
    items,
    deliveryMethod,
    customer: customerInput,
    address: addressInput,
    instructions,
    notes,
    promoCodeId,
    discountEuros,
    payment,
  } = input;

  const isCash = payment.method === "cash";

  // Re-fetch dishes and menu from DB
  const dishIds = items.map((i) => i.lacDishId);
  const dishes = await prisma.lacDish.findMany({
    where: { id: { in: dishIds }, lacMenuId },
  });
  const dishMap = new Map(dishes.map((d) => [d.id, d]));
  const menu = await prisma.lacMenu.findUnique({ where: { id: lacMenuId } });

  // Upsert CustomerProfile
  const email = customerInput.email.trim();
  const { firstName, lastName, phone } = customerInput;

  const customer = await prisma.customerProfile.upsert({
    where: { email },
    create: { email, firstName, lastName, phone: phone || null },
    update: { firstName, lastName, phone: phone || null },
  });

  // Address if delivery
  let address: { id: string } | null = null;
  if (deliveryMethod === "local_delivery" && addressInput?.line1) {
    address = await prisma.address.create({
      data: {
        customerProfileId: customer.id,
        line1: addressInput.line1,
        line2: addressInput.line2 || null,
        postalCode: addressInput.postalCode || "",
        city: addressInput.city || "",
        country: "FR",
      },
    });
  }

  // Totals from DB prices
  const subtotalCents = items.reduce((sum, item) => {
    const dish = dishMap.get(item.lacDishId);
    if (!dish) return sum;
    return sum + Math.round(Number(dish.price) * 100) * item.quantity;
  }, 0);

  const lacDeliveryFee = await getNumberSetting(
    SETTING_KEYS.LAC_DELIVERY_FEE.key,
    SETTING_KEYS.LAC_DELIVERY_FEE.default
  );
  const shippingCents =
    deliveryMethod === "local_delivery" ? Math.round(lacDeliveryFee * 100) : 0;
  const discountCents = promoCodeId ? Math.round(discountEuros * 100) : 0;
  const totalCents = subtotalCents + shippingCents - discountCents;

  const subtotalEuros = subtotalCents / 100;
  const shippingEuros = shippingCents / 100;
  const appliedDiscountEuros = discountCents / 100;
  const totalEuros = totalCents / 100;

  const orderItems = items
    .map((item) => {
      const dish = dishMap.get(item.lacDishId);
      if (!dish) return null;
      return {
        itemType: "lac_dish",
        itemId: dish.id,
        itemNameSnapshot: dish.name,
        itemPriceSnapshot: Number(dish.price),
        quantity: item.quantity,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const orderNumber = `LAC-${Date.now().toString(36).toUpperCase()}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      type: "lac",
      lacMenuId,
      customerProfileId: customer.id,
      guestEmail: email,
      // Espèces : commande enregistrée, paiement à encaisser à la remise.
      status: isCash ? "new" : "paid",
      subtotal: subtotalEuros,
      shippingCost: shippingEuros,
      discountAmount: appliedDiscountEuros,
      total: totalEuros,
      promoCodeId: promoCodeId || null,
      paymentProvider: isCash ? "cash" : "stripe",
      paymentStatus: isCash ? "pending" : "paid",
      stripeSessionId: payment.method === "card" ? payment.stripeSessionId : null,
      deliveryMethod,
      shippingAddressId: address?.id || null,
      notes: notes || null,
      items: { create: orderItems },
    },
  });
  console.log(
    `[lac-order] Order created (${payment.method}):`,
    order.id,
    orderNumber
  );

  // Promo code redemption
  if (promoCodeId && appliedDiscountEuros > 0) {
    await prisma.promoCodeRedemption.create({
      data: {
        promoCodeId,
        orderId: order.id,
        customerProfileId: customer.id,
        guestEmail: email,
        discountAmount: appliedDiscountEuros,
      },
    });
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Customer confirmation email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chezmisou.com";
  const serviceDateStr = menu
    ? menu.serviceDate.toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const emailItems = orderItems.map((oi) => ({
    name: oi.itemNameSnapshot,
    quantity: oi.quantity,
    unitPrice: oi.itemPriceSnapshot,
    total: oi.itemPriceSnapshot * oi.quantity,
  }));

  try {
    const customerHtml = await render(
      OrderConfirmationLac({
        firstName,
        orderNumber,
        serviceDate: serviceDateStr,
        deliveryMethod,
        paymentMethod: payment.method,
        items: emailItems,
        subtotal: subtotalEuros,
        shippingCost: shippingEuros,
        discount: appliedDiscountEuros,
        total: totalEuros,
        address:
          deliveryMethod === "local_delivery" && addressInput
            ? {
                line1: addressInput.line1,
                line2: addressInput.line2 || undefined,
                postalCode: addressInput.postalCode,
                city: addressInput.city,
              }
            : undefined,
        deliveryInstructions: instructions || undefined,
        appUrl,
      })
    );

    await resend.emails.send({
      from: RESEND_FROM,
      to: email,
      subject: `Chez Misou — Confirmation commande LAC #${orderNumber}`,
      html: customerHtml,
    });
  } catch (err) {
    console.error("[lac-order] Failed to send customer email:", err);
  }

  // Admin notification
  await sendAdminNotification({
    orderNumber,
    orderId: order.id,
    orderLabel: "LAC",
    customerName: `${firstName} ${lastName}`,
    customerEmail: email,
    emailItems,
    subtotalEuros,
    shippingEuros,
    totalEuros,
    paymentNote: isCash
      ? `💶 Paiement en espèces : ${totalEuros.toFixed(2)} € à encaisser à la remise`
      : undefined,
    address: {
      line1: addressInput?.line1 || "",
      line2: addressInput?.line2,
      postalCode: addressInput?.postalCode || "",
      city: addressInput?.city || "",
      country: "FR",
    },
    subject: `${isCash ? "[Espèces] " : ""}Nouvelle commande LAC #${orderNumber} — ${serviceDateStr}`,
  });

  return { order, orderNumber, totalEuros };
}
