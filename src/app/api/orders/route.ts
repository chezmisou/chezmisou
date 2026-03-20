import { NextRequest, NextResponse } from "next/server";

// POST /api/orders — Create a new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      promoCode,
      notes,
      type = "TRAITEUR",
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide" },
        { status: 400 }
      );
    }
    if (!customerName || !customerPhone || !customerEmail) {
      return NextResponse.json(
        { error: "Informations client manquantes" },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: number; quantity: number }) =>
        sum + item.unitPrice * item.quantity,
      0
    );
    const deliveryFee = deliveryMethod === "DELIVERY" ? (subtotal >= 50 ? 0 : 5) : 0;
    const total = subtotal + deliveryFee;

    // Generate order ID
    const orderId = `CM-${Date.now().toString(36).toUpperCase()}`;

    // In production, this would save to database via Prisma
    // and process payment via Stripe
    const order = {
      id: orderId,
      items,
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      deliveryAddress,
      deliverySlot,
      paymentMethod,
      promoCode,
      notes,
      type,
      subtotal,
      deliveryFee,
      total,
      status: "RECEIVED",
      paymentStatus: paymentMethod === "CASH" ? "PENDING" : "PENDING",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande" },
      { status: 500 }
    );
  }
}

// GET /api/orders — List orders (admin)
export async function GET() {
  // In production, fetch from database with auth check
  const orders = [
    {
      id: "CM-ABC123",
      customer: "Marie Jean-Baptiste",
      total: 51,
      status: "RECEIVED",
      type: "TRAITEUR",
      createdAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json(orders);
}
