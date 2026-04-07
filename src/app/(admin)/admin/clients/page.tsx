import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eye } from "lucide-react";
import ClientSearch from "@/components/admin/ClientSearch";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays <= 30) return `Il y a ${diffDays} jour${diffDays > 1 ? "s" : ""}`;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await prisma.customerProfile.findMany({
    include: {
      orders: {
        where: { paymentStatus: "paid" },
        select: { total: true, createdAt: true },
      },
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Compute stats per customer
  const customersWithStats = customers.map((c) => {
    const ordersCount = c.orders.length;
    const totalSpent = c.orders.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );
    const lastOrderDate =
      c.orders.length > 0
        ? c.orders.reduce((latest, o) =>
            o.createdAt > latest.createdAt ? o : latest
          ).createdAt
        : null;

    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      ordersCount,
      totalSpent,
      lastOrderDate,
    };
  });

  // Filter by search query (server-side)
  const filtered = q
    ? customersWithStats.filter((c) => {
        const search = q.toLowerCase();
        const name =
          `${c.firstName || ""} ${c.lastName || ""}`.toLowerCase();
        return (
          name.includes(search) || c.email.toLowerCase().includes(search)
        );
      })
    : customersWithStats;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Clients
        </h1>
        <p className="text-text-body mt-1">
          {customers.length} client{customers.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      <ClientSearch currentQuery={q || ""} />

      {filtered.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-lg">
            {q
              ? "Aucun client ne correspond à votre recherche."
              : "Aucun client pour le moment. Les clients apparaîtront ici après leur première commande."}
          </p>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20 bg-blanc-creme/50">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Nom
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden md:table-cell">
                    Téléphone
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Commandes
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Total dépensé
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden lg:table-cell">
                    Dernière commande
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const name =
                    `${c.firstName || ""} ${c.lastName || ""}`.trim() ||
                    "Client invité";

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-marron-profond">
                        {name}
                      </td>
                      <td className="py-3 px-4 text-text-body">{c.email}</td>
                      <td className="py-3 px-4 text-text-body hidden md:table-cell">
                        {c.phone || "—"}
                      </td>
                      <td className="py-3 px-4 text-center text-marron-profond font-semibold">
                        {c.ordersCount}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-marron-profond">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right text-text-body hidden lg:table-cell">
                        {c.lastOrderDate
                          ? formatRelativeDate(c.lastOrderDate)
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/clients/${c.id}`}
                          className="inline-flex items-center gap-1 text-orange hover:text-orange-vif text-xs font-medium"
                        >
                          <Eye size={14} />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
