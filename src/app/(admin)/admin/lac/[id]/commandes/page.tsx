import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import PrintButton from "@/components/admin/PrintButton";

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default async function LacMenuCommandesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const menu = await prisma.lacMenu.findUnique({
    where: { id },
    include: {
      dishes: { orderBy: { position: "asc" } },
    },
  });

  if (!menu) {
    notFound();
  }

  const orders = await prisma.order.findMany({
    where: { type: "lac", lacMenuId: id, paymentStatus: "paid" },
    include: {
      items: true,
      customer: true,
      address: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalPortions = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity, 0),
    0
  );

  // Répartition par plat
  const dishTotals: Record<string, { name: string; total: number }> = {};
  for (const dish of menu.dishes) {
    dishTotals[dish.id] = { name: dish.name, total: 0 };
  }
  for (const order of orders) {
    for (const item of order.items) {
      if (item.itemType === "lac_dish" && dishTotals[item.itemId]) {
        dishTotals[item.itemId].total += item.quantity;
      }
    }
  }

  const pickupOrders = orders.filter((o) => o.deliveryMethod === "pickup");
  const deliveryOrders = orders.filter((o) => o.deliveryMethod === "local_delivery");

  const serviceDateFormatted = format(menu.serviceDate, "EEEE d MMMM yyyy", {
    locale: fr,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 print:space-y-4">
      <div className="flex items-center justify-between print:block">
        <div>
          <Link
            href="/admin/lac"
            className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2 print:hidden"
          >
            <ChevronLeft size={16} />
            Retour aux menus
          </Link>
          <h1 className="font-serif text-3xl font-bold text-marron-profond capitalize">
            Commandes du {serviceDateFormatted}
          </h1>
        </div>
        <PrintButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
          <p className="text-gris-chaud uppercase tracking-widest text-xs mb-2">
            Commandes payées
          </p>
          <p className="font-serif text-4xl font-bold text-marron-profond print:text-2xl">
            {orders.length}
          </p>
        </div>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
          <p className="text-gris-chaud uppercase tracking-widest text-xs mb-2">
            Chiffre d&apos;affaires
          </p>
          <p className="font-serif text-4xl font-bold text-marron-profond print:text-2xl">
            {formatCurrency(totalRevenue)}
          </p>
        </div>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
          <p className="text-gris-chaud uppercase tracking-widest text-xs mb-2">
            Portions commandées
          </p>
          <p className="font-serif text-4xl font-bold text-marron-profond print:text-2xl">
            {totalPortions}
          </p>
        </div>
      </div>

      {/* Répartition par plat */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
        <h2 className="font-serif text-xl font-bold text-marron-profond mb-4">
          Répartition par plat
        </h2>
        {Object.values(dishTotals).length === 0 ? (
          <p className="text-gris-chaud">Aucun plat dans ce menu.</p>
        ) : (
          <div className="space-y-3">
            {Object.values(dishTotals).map((dish) => (
              <div
                key={dish.name}
                className="flex items-center justify-between py-2 border-b border-marron-doux/10 last:border-0"
              >
                <span className="text-marron-profond font-medium">{dish.name}</span>
                <span className="font-serif text-3xl font-bold text-orange print:text-xl">
                  {dish.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retrait sur place */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
        <h2 className="font-serif text-xl font-bold text-marron-profond mb-4">
          Retrait sur place ({pickupOrders.length})
        </h2>
        {pickupOrders.length === 0 ? (
          <p className="text-gris-chaud">Aucune commande en retrait.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Client
                  </th>
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Téléphone
                  </th>
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Plats commandés
                  </th>
                  <th className="text-right py-2 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Détail
                  </th>
                </tr>
              </thead>
              <tbody>
                {pickupOrders.map((order) => {
                  const name = order.customer
                    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                    : order.guestEmail || "Client";
                  const phone = order.customer?.phone || "";
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-marron-doux/10"
                    >
                      <td className="py-2 pr-4 text-marron-profond font-medium">
                        {name}
                      </td>
                      <td className="py-2 pr-4 text-text-body">{phone}</td>
                      <td className="py-2 pr-4 text-text-body">
                        {order.items.map((it) => `${it.quantity}× ${it.itemNameSnapshot}`).join(", ")}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-orange hover:text-orange-vif text-sm font-medium print:hidden"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Livraison */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 print:shadow-none print:border print:p-4">
        <h2 className="font-serif text-xl font-bold text-marron-profond mb-4">
          Livraison ({deliveryOrders.length})
        </h2>
        {deliveryOrders.length === 0 ? (
          <p className="text-gris-chaud">Aucune commande en livraison.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Client
                  </th>
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Adresse
                  </th>
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Téléphone
                  </th>
                  <th className="text-left py-2 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Plats commandés
                  </th>
                  <th className="text-right py-2 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Détail
                  </th>
                </tr>
              </thead>
              <tbody>
                {deliveryOrders.map((order) => {
                  const name = order.customer
                    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                    : order.guestEmail || "Client";
                  const phone = order.customer?.phone || "";
                  const addr = order.address
                    ? `${order.address.line1}${order.address.line2 ? `, ${order.address.line2}` : ""}, ${order.address.postalCode} ${order.address.city}`
                    : "";
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-marron-doux/10"
                    >
                      <td className="py-2 pr-4 text-marron-profond font-medium">
                        {name}
                      </td>
                      <td className="py-2 pr-4 text-text-body text-xs">
                        {addr}
                      </td>
                      <td className="py-2 pr-4 text-text-body">{phone}</td>
                      <td className="py-2 pr-4 text-text-body">
                        {order.items.map((it) => `${it.quantity}× ${it.itemNameSnapshot}`).join(", ")}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-orange hover:text-orange-vif text-sm font-medium print:hidden"
                        >
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
