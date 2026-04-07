"use client";

import { useState } from "react";
import { Search, Package, ChevronDown, ChevronUp } from "lucide-react";

interface OrderItem {
  id: string;
  itemNameSnapshot: string;
  itemPriceSnapshot: string;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: string;
  subtotal: string;
  shippingCost: string;
  discountAmount: string;
  createdAt: string;
  items: OrderItem[];
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

export default function MesCommandesPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders/by-email?email=${encodeURIComponent(email.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-[60vh] max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl font-bold text-text-dark mb-2">
        Mes commandes
      </h1>
      <p className="text-text-body mb-8">
        Retrouvez l&apos;historique de vos commandes en entrant votre adresse
        email.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-chaud"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange text-blanc px-6 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
        >
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </form>

      {searched && orders.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto text-marron-doux mb-4" />
          <p className="text-text-body text-lg">
            Aucune commande trouvée pour cet email
          </p>
          <p className="text-gris-chaud text-sm mt-1">
            Vérifiez l&apos;adresse utilisée lors de votre commande.
          </p>
        </div>
      )}

      {orders.length > 0 && (
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
                          <span>
                            -{formatCurrency(order.discountAmount)}
                          </span>
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
      )}
    </div>
  );
}
