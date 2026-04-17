"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package } from "lucide-react";

export interface OrderItemDTO {
  id: string;
  itemNameSnapshot: string;
  itemPriceSnapshot: string;
  quantity: number;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  createdAt: string;
  items: OrderItemDTO[];
}

const statusLabels: Record<string, { label: string; className: string }> = {
  new: { label: "En attente", className: "bg-gray-100 text-gray-700" },
  paid: { label: "Payée", className: "bg-blue-100 text-blue-700" },
  preparing: {
    label: "En préparation",
    className: "bg-yellow-100 text-yellow-700",
  },
  shipped: { label: "Expédiée", className: "bg-yellow-100 text-yellow-700" },
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function OrdersList({ orders }: { orders: OrderDTO[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="mx-auto text-marron-doux mb-4" />
        <p className="text-text-body text-lg">Aucune commande pour l&apos;instant</p>
        <p className="text-gris-chaud text-sm mt-1">
          Vos commandes apparaîtront ici une fois passées.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const st = statusLabels[order.status] || statusLabels.new;
        const isExpanded = expandedId === order.id;

        return (
          <div
            key={order.id}
            className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden"
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-blanc-creme/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-xs text-orange">
                  {order.orderNumber}
                </span>
                <span className="text-text-body text-sm">
                  {formatDate(order.createdAt)}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.className}`}
                >
                  {st.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-marron-profond">
                  {formatCurrency(order.total)}
                </span>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-gris-chaud" />
                ) : (
                  <ChevronDown size={16} className="text-gris-chaud" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-marron-doux/10">
                <div className="space-y-2 pt-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-marron-profond">
                        {item.itemNameSnapshot} × {item.quantity}
                      </span>
                      <span className="text-text-body">
                        {formatCurrency(
                          Number(item.itemPriceSnapshot) * item.quantity
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-marron-doux/10 text-sm space-y-1">
                  <div className="flex justify-between text-text-body">
                    <span>Sous-total</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  {Number(order.shippingCost) > 0 && (
                    <div className="flex justify-between text-text-body">
                      <span>Livraison</span>
                      <span>{formatCurrency(order.shippingCost)}</span>
                    </div>
                  )}
                  {Number(order.discountAmount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Remise</span>
                      <span>-{formatCurrency(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-marron-profond">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
