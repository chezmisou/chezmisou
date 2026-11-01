import { NextRequest, NextResponse } from "next/server";
import type { OrderStatus, OrderType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { orderInclude, serializeOrder } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

const TYPES: OrderType[] = ["epicerie", "lac"];
const STATUSES: OrderStatus[] = ["new", "paid", "preparing", "shipped", "delivered", "cancelled", "refunded"];

/** Liste des commandes (filtres : type, status, q). */
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") as OrderType | null;
  const status = sp.get("status") as OrderStatus | null;
  const q = sp.get("q")?.trim();

  const where: Prisma.OrderWhereInput = {
    ...(type && TYPES.includes(type) ? { type } : {}),
    ...(status && STATUSES.includes(status) ? { status } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" as const } },
            { guestEmail: { contains: q, mode: "insensitive" as const } },
            { customer: { lastName: { contains: q, mode: "insensitive" as const } } },
            { customer: { firstName: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: orderInclude,
  });
  return NextResponse.json({ orders: orders.map(serializeOrder) });
}
