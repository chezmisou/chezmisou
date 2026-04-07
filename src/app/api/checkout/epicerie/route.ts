import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";

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
}

export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();
    const { items, customer, address, notes } = body;

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

    // --- Calculate subtotal (in cents) from DB prices ---
    const subtotalCents = items.reduce((sum, item) => {
      const variant = variantMap.get(item.variantId)!;
      return sum + Math.round(Number(variant.price) * 100) * item.quantity;
    }, 0);

    // --- Shipping options ---
    const shippingOptions =
      subtotalCents >= 6000
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
                fixed_amount: { amount: 690, currency: "eur" },
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

    // --- Create Stripe Checkout Session ---
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      shipping_options: shippingOptions,
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
