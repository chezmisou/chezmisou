import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { guestEmail: email.trim().toLowerCase() },
          { customer: { email: email.trim().toLowerCase() } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        items: true,
      },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("Error fetching orders by email:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
