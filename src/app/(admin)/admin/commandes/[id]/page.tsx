import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-gris-chaud/20 text-text-dark" },
  paid: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  preparing: { label: "En préparation", className: "bg-orange-clair/30 text-orange" },
  shipped: { label: "Expédiée", className: "bg-jaune-clair/50 text-text-dark" },
  delivered: { label: "Livrée", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursée", className: "bg-purple-100 text-purple-700" },
};

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default async function AdminCommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
      address: true,
    },
  });

  if (!order) {
    notFound();
  }

  const st = statusConfig[order.status] || statusConfig.new;

  const clientName = order.customer
    ? `${order.customer.firstName || ""} ${order.customer.lastName || ""}`.trim()
    : "Client";
  const clientEmail = order.customer?.email || order.guestEmail || "";
  const clientPhone = order.customer?.phone || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/commandes"
          className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2"
        >
          <ChevronLeft size={16} />
          Retour aux commandes
        </Link>

        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-serif text-3xl font-bold text-marron-profond">
            Commande {order.orderNumber}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${st.className}`}
          >
            {st.label}
          </span>
        </div>
        <p className="text-text-body mt-1">
          {format(order.createdAt, "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client info */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
            Client
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-marron-profond font-medium">{clientName}</p>
            {clientEmail && <p className="text-text-body">{clientEmail}</p>}
            {clientPhone && <p className="text-text-body">{clientPhone}</p>}
          </div>
        </div>

        {/* Delivery */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
            Livraison
          </h2>
          <div className="space-y-2 text-sm">
            <p className="text-text-body capitalize">
              {order.deliveryMethod === "pickup"
                ? "Retrait sur place"
                : order.deliveryMethod === "local_delivery"
                  ? "Livraison locale"
                  : "Livraison"}
            </p>
            {order.address && (
              <div className="text-marron-profond">
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {order.address.postalCode} {order.address.city}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
          Articles
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-marron-doux/10 last:border-0"
            >
              <div>
                <p className="text-marron-profond font-medium">
                  {item.itemNameSnapshot}
                </p>
                <p className="text-gris-chaud text-xs">
                  {formatCurrency(item.itemPriceSnapshot)} × {item.quantity}
                </p>
              </div>
              <p className="text-marron-profond font-semibold">
                {formatCurrency(
                  Number(item.itemPriceSnapshot) * item.quantity
                )}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-marron-doux/20 space-y-1 text-sm">
          <div className="flex justify-between text-text-body">
            <span>Sous-total</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          {Number(order.shippingCost) > 0 && (
            <div className="flex justify-between text-text-body">
              <span>Frais de livraison</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
          )}
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Remise</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-marron-profond text-lg pt-2">
            <span>Total</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment info */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
          Paiement
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gris-chaud">Fournisseur</span>
            <span className="text-marron-profond">
              {order.paymentProvider || "Stripe"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gris-chaud">Statut</span>
            <span className="text-marron-profond capitalize">
              {order.paymentStatus}
            </span>
          </div>
          {order.stripeSessionId && (
            <div className="flex justify-between">
              <span className="text-gris-chaud">Session Stripe</span>
              <span className="text-marron-profond font-mono text-xs">
                {order.stripeSessionId}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-3">
            Notes du client
          </h2>
          <p className="text-text-body text-sm whitespace-pre-wrap">
            {order.notes}
          </p>
        </div>
      )}

      {/* Status updater */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
          Changer le statut
        </h2>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
