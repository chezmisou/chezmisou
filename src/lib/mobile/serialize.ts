import type { Prisma } from "@prisma/client";

/** Convertit un Decimal Prisma (ou null) en nombre pour le JSON de l'app. */
export function num(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export function numOrNull(
  value: Prisma.Decimal | number | string | null | undefined
): number | null {
  if (value === null || value === undefined) return null;
  return Number(value);
}

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: true;
    address: true;
    customer: true;
  };
}>;

/** Forme commune d'une commande renvoyée à l'app (client et admin). */
export function serializeOrder(o: OrderWithRelations) {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    type: o.type,
    status: o.status,
    paymentProvider: o.paymentProvider,
    paymentStatus: o.paymentStatus,
    deliveryMethod: o.deliveryMethod,
    pickupLocation: o.pickupLocation,
    deliveryDistanceKm: numOrNull(o.deliveryDistanceKm),
    subtotal: num(o.subtotal),
    shippingCost: num(o.shippingCost),
    discountAmount: num(o.discountAmount),
    total: num(o.total),
    notes: o.notes,
    lacMenuId: o.lacMenuId,
    createdAt: o.createdAt.toISOString(),
    customer: o.customer
      ? {
          email: o.customer.email,
          firstName: o.customer.firstName,
          lastName: o.customer.lastName,
          phone: o.customer.phone,
        }
      : null,
    guestEmail: o.guestEmail,
    address: o.address
      ? {
          line1: o.address.line1,
          line2: o.address.line2,
          postalCode: o.address.postalCode,
          city: o.address.city,
          country: o.address.country,
        }
      : null,
    items: o.items.map((it) => ({
      id: it.id,
      itemType: it.itemType,
      name: it.itemNameSnapshot,
      unitPrice: num(it.itemPriceSnapshot),
      quantity: it.quantity,
    })),
  };
}

export const orderInclude = {
  items: true,
  address: true,
  customer: true,
} as const;
