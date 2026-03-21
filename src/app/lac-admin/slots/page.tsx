"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Edit3,
  XCircle,
  Copy,
  X,
  ChevronDown,
  Calendar,
  Save,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

interface ChurchData {
  id: string;
  name: string;
  color: string;
}

interface SlotData {
  id: string;
  date: string;
  churchId: string;
  churchName: string;
  churchColor: string;
  status: string;
  notes?: string;
}

const statusOptions = [
  { value: "confirmed", label: "Confirm\u00E9" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annul\u00E9" },
  { value: "completed", label: "Termin\u00E9" },
];

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } },
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
    pending: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    cancelled: "bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400",
    completed: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
  };
  return styles[status] || styles.pending;
};

export default function SlotsPage() {
  const [slots, setSlots] = useState<SlotData[]>([]);
  const [churches, setChurches] = useState<ChurchData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterChurch, setFilterChurch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [editSlot, setEditSlot] = useState<SlotData | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    churchId: "",
    status: "",
    notes: "",
  });

  const [cancelSlot, setCancelSlot] = useState<SlotData | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/lac/slots")
        .then((r) => r.json())
        .catch(() => ({ slots: [] })),
      fetch("/api/lac/churches")
        .then((r) => r.json())
        .catch(() => ({ churches: [] })),
    ])
      .then(([sData, cData]) => {
        setSlots(sData.slots || []);
        setChurches(cData.churches || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return slots.filter((s) => {
      if (
        searchQuery &&
        !s.churchName.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      if (filterChurch && s.churchId !== filterChurch) return false;
      if (filterStatus && s.status !== filterStatus) return false;
      if (filterDateFrom && s.date < filterDateFrom) return false;
      if (filterDateTo && s.date > filterDateTo) return false;
      return true;
    });
  }, [slots, searchQuery, filterChurch, filterStatus, filterDateFrom, filterDateTo]);

  const openEdit = (slot: SlotData) => {
    setEditSlot(slot);
    setEditForm({
      date: slot.date,
      churchId: slot.churchId,
      status: slot.status,
      notes: slot.notes || "",
    });
  };

  const handleEditSave = async () => {
    if (!editSlot) return;
    try {
      const res = await fetch(`/api/lac/slots/${editSlot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed");
      const church = churches.find((c) => c.id === editForm.churchId);
      setSlots((prev) =>
        prev.map((s) =>
          s.id === editSlot.id
            ? {
                ...s,
                date: editForm.date,
                churchId: editForm.churchId,
                churchName: church?.name || s.churchName,
                churchColor: church?.color || s.churchColor,
                status: editForm.status,
                notes: editForm.notes,
              }
            : s
        )
      );
      setEditSlot(null);
      toast.success("Cr\u00E9neau modifi\u00E9");
    } catch {
      toast.error("Erreur lors de la modification");
    }
  };

  const handleCancel = async () => {
    if (!cancelSlot) return;
    try {
      const res = await fetch(`/api/lac/slots/${cancelSlot.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          notes: cancelReason || "Annul\u00E9",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSlots((prev) =>
        prev.map((s) =>
          s.id === cancelSlot.id
            ? { ...s, status: "cancelled", notes: cancelReason || "Annul\u00E9" }
            : s
        )
      );
      setCancelSlot(null);
      setCancelReason("");
      toast.success("Cr\u00E9neau annul\u00E9");
    } catch {
      toast.error("Erreur lors de l\u2019annulation");
    }
  };

  const handleDuplicate = async (slot: SlotData) => {
    try {
      const res = await fetch("/api/lac/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: slot.date,
          churchId: slot.churchId,
          notes: `Dupliqu\u00E9 de ${slot.date}`,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (data.slot) {
        setSlots((prev) => [
          ...prev,
          {
            ...slot,
            id: data.slot.id,
            notes: `Dupliqu\u00E9 de ${slot.date}`,
            status: "pending",
          },
        ]);
      }
      toast.success("Cr\u00E9neau dupliqu\u00E9");
    } catch {
      toast.error("Erreur lors de la duplication");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cr\u00E9neaux</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          G\u00E9rez tous les cr\u00E9neaux d&apos;acc\u00E8s
        </p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par \u00E9glise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              showFilters
                ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Filter size={16} />
            Filtres
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    \u00C9glise
                  </label>
                  <div className="relative">
                    <select
                      value={filterChurch}
                      onChange={(e) => setFilterChurch(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Toutes</option>
                      {churches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Statut
                  </label>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Tous</option>
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Date d\u00E9but
                  </label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Date fin
                  </label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slots table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Aucun cr\u00E9neau trouv\u00E9</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    \u00C9glise
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                    Notes
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap capitalize">
                      {format(new Date(slot.date), "EEE d MMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: slot.churchColor || "#6366f1" }}
                        />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {slot.churchName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(slot.status)}`}
                      >
                        {statusOptions.find((o) => o.value === slot.status)?.label || slot.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell max-w-[200px] truncate">
                      {slot.notes || "\u2014"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(slot)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => setCancelSlot(slot)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                          title="Annuler"
                        >
                          <XCircle size={15} />
                        </button>
                        <button
                          onClick={() => handleDuplicate(slot)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-violet-500 transition-colors"
                          title="Dupliquer"
                        >
                          <Copy size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setEditSlot(null)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Modifier le cr\u00E9neau
                </h2>
                <button
                  onClick={() => setEditSlot(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    \u00C9glise
                  </label>
                  <div className="relative">
                    <select
                      value={editForm.churchId}
                      onChange={(e) => setEditForm({ ...editForm, churchId: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {churches.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Statut
                  </label>
                  <div className="relative">
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setEditSlot(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={handleEditSave}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
                >
                  <Save size={16} />
                  Enregistrer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {cancelSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              onClick={() => setCancelSlot(null)}
              className="absolute inset-0 bg-black/50"
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Annuler le cr\u00E9neau
                </h2>
                <button
                  onClick={() => setCancelSlot(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Vous \u00EAtes sur le point d&apos;annuler le cr\u00E9neau de{" "}
                  <strong className="text-gray-900 dark:text-white">
                    {cancelSlot.churchName}
                  </strong>{" "}
                  le{" "}
                  <strong className="text-gray-900 dark:text-white capitalize">
                    {format(new Date(cancelSlot.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </strong>
                  .
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Raison (optionnel)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    placeholder="Indiquez la raison de l\u2019annulation..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setCancelSlot(null)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Retour
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                >
                  Confirmer l&apos;annulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
