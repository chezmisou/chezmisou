import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusLabels: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-gris-chaud/20 text-text-dark" },
  paid: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  preparing: {
    label: "En préparation",
    className: "bg-orange-clair/30 text-orange",
  },
  shipped: { label: "Expédiée", className: "bg-jaune-clair/50 text-text-dark" },
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-purple-100 text-purple-700" },
};

function formatCurrency(value: unknown): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    ordersToday,
    revenueResult,
    revenueTodayResult,
    _activeProducts,
    lowStockVariants,
    recentOrders,
    upcomingLacMenu,
    pendingQuotes,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid" },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "paid", createdAt: { gte: today } },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.productVariant.count({ where: { stock: { lt: 5 } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.lacMenu.findFirst({
      where: { isPublished: true, serviceDate: { gte: new Date() } },
      orderBy: { serviceDate: "asc" },
    }),
    prisma.quoteRequest.count({
      where: { status: { in: ["new", "in_progress"] } },
    }),
  ]);

  const lacOrderCount = upcomingLacMenu
    ? await prisma.order.count({
        where: { type: "lac", lacMenuId: upcomingLacMenu.id, paymentStatus: "paid" },
      })
    : 0;

  const totalRevenue = Number(revenueResult._sum.total) || 0;
  const todayRevenue = Number(revenueTodayResult._sum.total) || 0;
  const dateFormatted = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  const stats = [
    {
      label: "Commandes aujourd'hui",
      value: ordersToday,
      sub: `${formatCurrency(todayRevenue)} de chiffre`,
    },
    {
      label: "Total commandes",
      value: totalOrders,
    },
    {
      label: "Chiffre d'affaires total",
      value: formatCurrency(totalRevenue),
    },
    {
      label: "Stock à surveiller",
      value: lowStockVariants,
      alert: lowStockVariants > 0,
    },
    {
      label: "Devis en attente",
      value: pendingQuotes,
      alert: pendingQuotes > 0,
      link: "/admin/devis?status=new",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Bonjour Misou 👋
        </h1>
        <p className="text-text-body mt-1 capitalize">{dateFormatted}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20"
          >
            <p className="text-gris-chaud uppercase tracking-widest text-xs mb-2">
              {stat.label}
            </p>
            <p
              className={`font-serif text-4xl font-bold ${
                stat.alert ? "text-red-600" : "text-marron-profond"
              }`}
            >
              {stat.value}
            </p>
            {stat.sub && (
              <p className="text-text-body text-sm mt-1">{stat.sub}</p>
            )}
            {stat.link && (
              <Link
                href={stat.link}
                className="text-orange hover:underline text-xs mt-2 inline-block"
              >
                Voir l&apos;inbox
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Prochain LAC */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-xl font-bold text-marron-profond mb-4">
          Prochain Lunch After Church
        </h2>
        {upcomingLacMenu ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-marron-profond font-medium capitalize">
                {format(upcomingLacMenu.serviceDate, "EEEE d MMMM yyyy", { locale: fr })}
              </p>
              <p className="text-text-body text-sm capitalize">
                Deadline : {format(upcomingLacMenu.orderDeadline, "EEEE d MMMM HH'h'mm", { locale: fr })}
              </p>
              <p className="text-text-body text-sm">
                {lacOrderCount} commande{lacOrderCount !== 1 ? "s" : ""} payée{lacOrderCount !== 1 ? "s" : ""}
              </p>
            </div>
            <Link
              href={`/admin/lac/${upcomingLacMenu.id}/commandes`}
              className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm whitespace-nowrap"
            >
              Voir le récap
            </Link>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gris-chaud">
              Aucun menu publié pour ce dimanche.
            </p>
            <Link
              href="/admin/lac/nouveau"
              className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm whitespace-nowrap"
            >
              Créer un menu
            </Link>
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-xl font-bold text-marron-profond mb-4">
          Dernières commandes
        </h2>

        {recentOrders.length === 0 ? (
          <p className="text-gris-chaud text-center py-8">
            Aucune commande pour le moment. Les commandes apparaîtront ici
            dès qu&apos;un client passera commande.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-3 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    N°
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Date
                  </th>
                  <th className="text-left py-3 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Client
                  </th>
                  <th className="text-right py-3 pr-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Total
                  </th>
                  <th className="text-center py-3 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => {
                  const status = statusLabels[order.status] || statusLabels.new;
                  const clientName = order.customer
                    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                    : order.guestEmail || "Client";
                  return (
                    <tr
                      key={order.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/50 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/commandes/${order.id}`}
                          className="text-orange hover:underline font-mono text-xs"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-text-body">
                        {format(order.createdAt, "dd/MM/yyyy HH:mm", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-3 pr-4 text-marron-profond">
                        {clientName}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-marron-profond">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
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
