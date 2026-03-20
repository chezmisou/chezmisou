import { NextRequest, NextResponse } from "next/server";

// POST /api/stripe — Create a payment intent
export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Montant invalide" },
        { status: 400 }
      );
    }

    // In production, create a real Stripe PaymentIntent:
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'usd',
    //   automatic_payment_methods: { enabled: true },
    // });
    // return NextResponse.json({ clientSecret: paymentIntent.client_secret });

    // For now, return a mock response
    return NextResponse.json({
      clientSecret: `pi_mock_${Date.now()}_secret`,
      amount,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}
