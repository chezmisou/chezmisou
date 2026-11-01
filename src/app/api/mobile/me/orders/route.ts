import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/auth/requireAdmin";
import { orderInclude, serializeOrder } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Commandes du client connecté (jeton Supabase de l'app). */
export async function GET() {
  const user = await getRequestUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const email = user.email.toLowerCase();
  const profile = await prisma.customerProfile.findFirst({
    where: { OR: [{ userId: user.id }, { email }] },
    select: { id: true },
  });
  const orders = await prisma.order.findMany({
    where: {
      OR: [...(profile ? [{ customerProfileId: profile.id }] : []), { guestEmail: email }],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: orderInclude,
  });
  return NextResponse.json({ orders: orders.map(serializeOrder) });
}
