'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Truck,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Order,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  TYPE_LABELS,
  DELIVERY_LABELS,
  getCustomerName,
  formatPrice,
  formatDateTime,
} from '@/lib/orders';

const ADMIN_PASSWORD = 'churchlunch2024';

const STATUS_ICONS: Record<string, React.ReactNode> = {
  PENDING: <Clock size={16} className="text-amber-500" />,
  CONFIRMED: <CheckCircle2 size={16} className="text-blue-500" />,
  PREPARING: <AlertCircle size={16} className="text-purple-500" />,
  READY: <CheckCircle2 size={16} className="text-cyan-500" />,
  DELIVERED: <CheckCircle2 size={16} className="text-green-500" />,
  CANCELLED: <XCircle size={16} className="text-red-500" />,
};

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'} ${large ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': ADMIN_PASSWORD,
  }), []);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { headers: headers() });
      if (!res.ok) throw new Error('Erreur');
      setOrder(await res.json());
    } catch {
      toast.error('Erreur lors du chargement de la commande');
    } finally {
      setLoading(false);
    }
  }, [orderId, headers]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur');
      }
      toast.success(`Statut mis à jour: ${STATUS_LABELS[newStatus]}`);
      fetchOrder();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#D4A017]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-500 dark:text-gray-400 mb-4">Commande introuvable</p>
        <Link href="/admin/commandes" className="text-[#D4A017] hover:underline">
          Retour aux commandes
        </Link>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[order.status] || [];
  const isTraiteur = order.type === 'TRAITEUR';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/commandes"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Commande {order.orderNumber || order.id.slice(0, 8)}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                isTraiteur
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {TYPE_LABELS[order.type] || order.type}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDateTime(order.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <StatusBadge status={order.status} large />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: order info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Informations client</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Nom</p>
                  <p className="font-medium text-gray-900 dark:text-white">{getCustomerName(order)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Téléphone</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user?.phone || order.guestPhone || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">{order.user?.email || order.guestEmail || '—'}</p>
                </div>
              </div>
              {isTraiteur && order.guestCount && (
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre de couverts</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.guestCount} personnes</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Delivery / pickup info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">
              {isTraiteur ? 'Livraison / Événement' : 'Mode de retrait'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-gray-400 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mode</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {DELIVERY_LABELS[order.deliveryMethod] || order.deliveryMethod}
                  </p>
                </div>
              </div>
              {order.deliveryAddress && (
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Adresse</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.deliveryAddress}</p>
                  </div>
                </div>
              )}
              {order.deliveryDate && (
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date souhaitée</p>
                    <p className="font-medium text-gray-900 dark:text-white">{formatDateTime(order.deliveryDate)}</p>
                  </div>
                </div>
              )}
              {order.deliverySlot && (
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Créneau</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.deliverySlot}</p>
                  </div>
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-4 flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
                <FileText size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Instructions / Notes</p>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order items */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <div className="p-5 pb-0">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Articles commandés</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Produit</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Qté</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Prix unit.</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{item.product.name}</div>
                        {item.size && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">Taille: {item.size.label}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatPrice(item.unitPrice)}</td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 dark:text-white">{formatPrice(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Sous-total</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Frais de livraison</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Réduction</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span>
                <span className="text-[#D4A017]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: actions + timeline */}
        <div className="space-y-6">
          {/* Action buttons */}
          {transitions.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-4">Actions</h2>
              <div className="space-y-2">
                {transitions.filter(s => s !== 'CANCELLED').map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-[#D4A017] text-white hover:bg-[#b8890f] transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Mise à jour...' : `Passer en "${STATUS_LABELS[status]}"`}
                  </button>
                ))}
                {transitions.includes('CANCELLED') && (
                  <button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
                        handleStatusChange('CANCELLED');
                      }
                    }}
                    disabled={updating}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                  >
                    Annuler la commande
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Status timeline */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Historique</h2>
            {order.statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">Aucun historique</p>
            ) : (
              <div className="space-y-4">
                {order.statusHistory.map((entry, i) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="mt-0.5">{STATUS_ICONS[entry.status] || <Clock size={16} className="text-gray-400" />}</div>
                      {i < order.statusHistory.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <StatusBadge status={entry.status} />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDateTime(entry.changedAt)}
                        {entry.changedBy && ` — ${entry.changedBy}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Paiement</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Méthode</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {order.paymentMethod === 'CARD' ? 'Carte' : 'Espèces'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Statut</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'PAID' ? 'text-green-500' :
                  order.paymentStatus === 'FAILED' ? 'text-red-500' :
                  order.paymentStatus === 'REFUNDED' ? 'text-blue-500' :
                  'text-amber-500'
                }`}>
                  {order.paymentStatus === 'PAID' ? 'Payé' :
                   order.paymentStatus === 'FAILED' ? 'Échoué' :
                   order.paymentStatus === 'REFUNDED' ? 'Remboursé' :
                   'En attente'}
                </span>
              </div>
              {order.promoCode && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Code promo</span>
                  <span className="font-mono text-sm text-[#D4A017]">{order.promoCode}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
