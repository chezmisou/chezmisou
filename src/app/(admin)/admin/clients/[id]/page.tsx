import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-gris-chaud/20 text-text-dark" },
  paid: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  preparing: {
    label: "En préparation",
    className: "bg-orange-clair/30 text-orange",
  },
  shipped: { label: "Expédiée", className: "bg-jaune-clair/50 text-text-dark" },
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  refunded: {
    label: "Remboursée",
    className: "bg-purple-100 text-purple-700",
  },
};

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const customer = await prisma.customerProfile.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  const name =
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "Client invité";

  const paidOrders = customer.orders.filter(
    (o) => o.paymentStatus === "paid"
  );
  const totalOrders = paidOrders.length;
  const totalSpent = paidOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );
  const avgBasket = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2"
        >
          <ChevronLeft size={16} />
          Retour à la liste
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          {name}
        </h1>
        <p className="text-text-body mt-1">{customer.email}</p>
      </div>

      {/* Informations */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
          Informations
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gris-chaud">Nom</span>
            <p className="text-marron-profond font-medium">{name}</p>
          </div>
          <div>
            <span className="text-gris-chaud">Email</span>
            <p className="text-marron-profond font-medium">{customer.email}</p>
          </div>
          <div>
            <span className="text-gris-chaud">Téléphone</span>
            <p className="text-marron-profond font-medium">
              {customer.phone || "—"}
            </p>
          </div>
          <div>
            <span className="text-gris-chaud">Date d&apos;inscription</span>
            <p className="text-marron-profond font-medium">
              {format(customer.createdAt, "d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      {/* Adresses */}
      {customer.addresses.length > 0 && (
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
            Adresses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customer.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-blanc-creme/50 rounded-xl p-4 border border-marron-doux/10 text-sm"
              >
                <p className="text-marron-profond">{addr.line1}</p>
                {addr.line2 && (
                  <p className="text-marron-profond">{addr.line2}</p>
                )}
                <p className="text-marron-profond">
                  {addr.postalCode} {addr.city}
                </p>
                <p className="text-gris-chaud">{addr.country}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-sm">Total commandes</p>
          <p className="font-serif text-2xl font-bold text-marron-profond mt-1">
            {totalOrders}
          </p>
        </div>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-sm">Total dépensé</p>
          <p className="font-serif text-2xl font-bold text-orange mt-1">
            {formatCurrency(totalSpent)}
          </p>
        </div>
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-sm">Panier moyen</p>
          <p className="font-serif text-2xl font-bold text-marron-profond mt-1">
            {formatCurrency(avgBasket)}
          </p>
        </div>
      </div>

      {/* Historique des commandes */}
      <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
        <div className="p-6 pb-0">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
            Historique des commandes
          </h2>
        </div>
        {customer.orders.length === 0 ? (
          <div className="p-6 pt-0">
            <p className="text-gris-chaud text-sm">
              Ce client n&apos;a pas encore passé de commande.
            </p>
          </div>
        ) : (
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
                {customer.orders.map((order) => {
                  const st =
                    statusConfig[order.status] || statusConfig.new;
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
        )}
      </div>
    </div>
  );
}
