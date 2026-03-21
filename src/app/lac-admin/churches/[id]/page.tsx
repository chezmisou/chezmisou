"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  X,
  Calendar,
  Clock,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import toast from "react-hot-toast";

interface ChurchDetail {
  id: string;
  name: string;
  slug: string;
  color: string;
  active: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
}

interface RecurrenceRule {
  id: string;
  frequency: string;
  label: string;
}

interface SlotHistory {
  id: string;
  date: string;
  status: string;
  notes?: string;
}

const frequencies = [
  { value: "WEEKLY", label: "Chaque semaine" },
  { value: "BIWEEKLY", label: "Toutes les 2 semaines" },
  { value: "FIRST_SUNDAY", label: "Premier dimanche du mois" },
  { value: "SECOND_SUNDAY", label: "Deuxi\u00E8me dimanche du mois" },
  { value: "THIRD_SUNDAY", label: "Troisi\u00E8me dimanche du mois" },
  { value: "FOURTH_SUNDAY", label: "Quatri\u00E8me dimanche du mois" },
  { value: "LAST_SUNDAY", label: "Dernier dimanche du mois" },
  { value: "MONTHLY", label: "Une fois par mois" },
];

export default function ChurchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<ChurchDetail>({
    id: "",
    name: "",
    slug: "",
    color: "#6366f1",
    active: true,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
  });

  const [rules, setRules] = useState<RecurrenceRule[]>([]);
  const [history, setHistory] = useState<SlotHistory[]>([]);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRuleFreq, setNewRuleFreq] = useState("FIRST_SUNDAY");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/lac/churches/${id}`).then((r) => r.json()),
      fetch(`/api/lac/churches/${id}/rules`).then((r) => r.json()).catch(() => ({ rules: [] })),
      fetch(`/api/lac/churches/${id}/slots`).then((r) => r.json()).catch(() => ({ slots: [] })),
    ])
      .then(([churchData, rulesData, slotsData]) => {
        if (churchData.church) {
          setForm(churchData.church);
        }
        setRules(rulesData.rules || []);
        setHistory(slotsData.slots || []);
      })
      .catch(() => toast.error("Erreur de chargement"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/lac/churches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Modifications enregistr\u00E9es");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/lac/churches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("\u00C9glise supprim\u00E9e");
      router.push("/lac-admin/churches");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddRule = async () => {
    try {
      const res = await fetch(`/api/lac/churches/${id}/rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frequency: newRuleFreq }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setRules((prev) => [...prev, data.rule]);
      setShowAddRule(false);
      toast.success("R\u00E8gle ajout\u00E9e");
    } catch {
      toast.error("Erreur lors de l\u2019ajout de la r\u00E8gle");
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const res = await fetch(`/api/lac/churches/${id}/rules/${ruleId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("R\u00E8gle supprim\u00E9e");
    } catch {
      toast.error("Erreur");
    }
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/lac-admin/churches"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: form.color }}
          >
            {form.name.charAt(0) || "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{form.name || "Nouvelle \u00E9glise"}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">/{form.slug}</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Informations g\u00E9n\u00E9rales
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du contact
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                T\u00E9l\u00E9phone
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Couleur
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <span className="text-xs text-gray-400">{form.color}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Adresse
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600" />
            </label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {form.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
          >
            <Trash2 size={16} />
            Supprimer
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </motion.form>

      {/* Recurrence Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            R\u00E8gles de r\u00E9currence
          </h2>
          <button
            onClick={() => setShowAddRule(!showAddRule)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
          >
            <Plus size={15} />
            Ajouter
          </button>
        </div>
        <div className="p-6 space-y-3">
          {showAddRule && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              <div className="relative flex-1">
                <select
                  value={newRuleFreq}
                  onChange={(e) => setNewRuleFreq(e.target.value)}
                  className="w-full appearance-none px-3 py-2 pr-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {frequencies.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={handleAddRule}
                className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
              >
                Ajouter
              </button>
              <button
                onClick={() => setShowAddRule(false)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
          {rules.length === 0 && !showAddRule ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
              Aucune r\u00E8gle de r\u00E9currence d\u00E9finie
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-indigo-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {rule.label || frequencies.find((f) => f.value === rule.frequency)?.label || rule.frequency}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-500"
                >
                  <X size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Historique des cr\u00E9neaux
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Aucun cr\u00E9neau enregistr\u00E9
              </p>
            </div>
          ) : (
            history.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {format(new Date(slot.date), "EEEE d MMMM yyyy", { locale: fr })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {slot.notes && (
                    <span className="text-xs text-gray-400 hidden sm:block">{slot.notes}</span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusBadge(slot.status)}`}
                  >
                    {slot.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
            className="absolute inset-0 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Supprimer cette \u00E9glise ?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Cette action est irr\u00E9versible. Tous les cr\u00E9neaux associ\u00E9s seront \u00E9galement supprim\u00E9s.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
