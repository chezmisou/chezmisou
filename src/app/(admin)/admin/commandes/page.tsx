import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye } from "lucide-react";
import { Prisma } from "@prisma/client";
import OrderFilters from "@/components/admin/OrderFilters";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-gris-chaud/20 text-text-dark" },
  paid: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  preparing: { label: "En préparation", className: "bg-orange-clair/30 text-orange" },
  shipped: { label: "Expédiée", className: "bg-jaune-clair/50 text-text-dark" },
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-purple-100 text-purple-700" },
};

const typeLabels: Record<string, { label: string; className: string }> = {
  epicerie: { label: "Épicerie", className: "bg-orange-clair/20 text-orange" },
  lac: { label: "LAC", className: "bg-jaune-clair/30 text-text-dark" },
};

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default async function AdminCommandesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string }>;
}) {
  const { status, type, q } = await searchParams;

  const where: Prisma.OrderWhereInput = {};

  if (status && status !== "ALL") {
    where.status = status as Prisma.EnumOrderStatusFilter;
  }
  if (type && type !== "ALL") {
    where.type = type as Prisma.EnumOrderTypeFilter;
  }
  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { firstName: true, lastName: true, email: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-bold text-marron-profond">
        Commandes
      </h1>

      <OrderFilters
        currentStatus={status || "ALL"}
        currentType={type || "ALL"}
        currentQuery={q || ""}
      />

      {orders.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-lg">Aucune commande trouvée</p>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20 bg-blanc-creme/50">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    N°
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Client
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden md:table-cell">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Total
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const st = statusConfig[order.status] || statusConfig.new;
                  const tp = typeLabels[order.type] || typeLabels.epicerie;
                  const clientName = order.customer
                    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
                    : "";
                  const clientEmail =
                    order.customer?.email || order.guestEmail || "";

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-orange">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {format(order.createdAt, "dd/MM/yyyy HH:mm", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-marron-profond font-medium">
                          {clientName || "Client"}
                        </div>
                        <div className="text-gris-chaud text-xs">
                          {clientEmail}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${tp.className}`}
                        >
                          {tp.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-marron-profond">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/commandes/${order.id}`}
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
