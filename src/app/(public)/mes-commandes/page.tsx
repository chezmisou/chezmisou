import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OrdersList, { type OrderDTO } from "./OrdersList";
import GuestOrderSearch from "./GuestOrderSearch";

export const dynamic = "force-dynamic";

export default async function MesCommandesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return (
      <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl font-bold text-text-dark mb-2">
          Mes commandes
        </h1>
        <GuestOrderSearch />
      </div>
    );
  }

  const email = user.email.toLowerCase();
  const profile = await prisma.customerProfile.findFirst({
    where: {
      OR: [{ userId: user.id }, { email }],
    },
    select: { id: true },
  });

  const orders = await prisma.order.findMany({
    where: {
      OR: [
        ...(profile ? [{ customerProfileId: profile.id }] : []),
        { guestEmail: email },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: true },
  });

  const orderDTOs: OrderDTO[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: o.total.toString(),
    subtotal: o.subtotal.toString(),
    shippingCost: o.shippingCost.toString(),
    discountAmount: o.discountAmount.toString(),
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      itemNameSnapshot: i.itemNameSnapshot,
      itemPriceSnapshot: i.itemPriceSnapshot.toString(),
      quantity: i.quantity,
    })),
  }));

  return (
    <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-text-dark mb-2">
        Mes commandes
      </h1>
      <p className="text-text-body mb-8">
        Retrouvez ici l&apos;historique de vos commandes.
      </p>

      <OrdersList orders={orderDTOs} />
    </div>
  );
}
