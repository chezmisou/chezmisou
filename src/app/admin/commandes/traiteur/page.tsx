'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Eye,
  Loader2,
  UtensilsCrossed,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Order,
  OrdersResponse,
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TRANSITIONS,
  getCustomerName,
  getCustomerPhone,
  formatPrice,
  formatDate,
  formatDateTime,
} from '@/lib/orders';

const ADMIN_PASSWORD = 'churchlunch2024';
const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function StatusDropdown({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (orderId: string, newStatus: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const transitions = STATUS_TRANSITIONS[order.status] || [];

  if (transitions.length === 0) return <StatusBadge status={order.status} />;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1">
        <StatusBadge status={order.status} />
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[160px]">
            {transitions.map((s) => (
              <button
                key={s}
                onClick={() => { onStatusChange(order.id, s); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function TraiteurOrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': ADMIN_PASSWORD,
  }), []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      params.set('type', 'TRAITEUR');
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { headers: headers() });
      if (!res.ok) throw new Error('Erreur');
      setData(await res.json());
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, dateFrom, dateTo, sortBy, sortOrder, headers]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
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
      fetchOrders();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commandes Traiteur</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Commandes pour événements et groupes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Rechercher par nom ou n° commande..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-[#D4A017] focus:outline-none"
            />
          </form>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-[#D4A017] focus:outline-none"
          >
            <option value="">Tous les statuts</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-[#D4A017] focus:outline-none" title="Date début" />
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:border-[#D4A017] focus:outline-none" title="Date fin" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#D4A017]" />
          </div>
        ) : !data?.orders.length ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            <UtensilsCrossed size={40} className="mx-auto mb-3 opacity-40" />
            <p>Aucune commande traiteur</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <SortHeader field="orderNumber" label="N°" current={sortBy} order={sortOrder} onSort={handleSort} />
                  <SortHeader field="createdAt" label="Date" current={sortBy} order={sortOrder} onSort={handleSort} />
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Client</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Couverts</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">Livraison</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Notes</th>
                  <SortHeader field="total" label="Montant" current={sortBy} order={sortOrder} onSort={handleSort} />
                  <SortHeader field="status" label="Statut" current={sortBy} order={sortOrder} onSort={handleSort} />
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {order.orderNumber || order.id.slice(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div>{formatDate(order.createdAt)}</div>
                      {order.deliveryDate && (
                        <div className="text-xs text-[#D4A017]">Événement: {formatDateTime(order.deliveryDate)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{getCustomerName(order)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{getCustomerPhone(order)}</div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400">
                      {order.guestCount ? `${order.guestCount} pers.` : '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400 text-xs max-w-[150px] truncate">
                      {order.deliveryAddress || '—'}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-500 dark:text-gray-400 text-xs max-w-[120px] truncate">
                      {order.notes || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusDropdown order={order} onStatusChange={handleStatusChange} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/admin/commandes/${order.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Eye size={14} />
                        Détail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.total} commande{pagination.total > 1 ? 's' : ''} — Page {pagination.page}/{pagination.totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SortHeader({ field, label, current, order, onSort }: {
  field: string; label: string; current: string; order: 'asc' | 'desc'; onSort: (field: string) => void;
}) {
  const active = current === field;
  return (
    <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
      <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-[#D4A017] transition-colors">
        {label}
        <ArrowUpDown size={14} className={active ? 'text-[#D4A017]' : 'text-gray-400'}
          style={active ? { transform: order === 'asc' ? 'scaleY(-1)' : undefined } : undefined} />
      </button>
    </th>
  );
}
