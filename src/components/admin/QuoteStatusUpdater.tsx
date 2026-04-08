"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const allStatuses = [
  { value: "new", label: "Nouvelle" },
  { value: "in_progress", label: "En cours" },
  { value: "quote_sent", label: "Devis envoyé" },
  { value: "accepted", label: "Acceptée" },
  { value: "refused", label: "Refusée" },
];

interface Props {
  quoteId: string;
  currentStatus: string;
}

export default function QuoteStatusUpdater({ quoteId, currentStatus }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (status === currentStatus) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/devis/${quoteId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la mise à jour");
        return;
      }

      toast.success("Statut mis à jour");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="flex-1 max-w-xs px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
        >
          {allStatuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleUpdate}
          disabled={saving || status === currentStatus}
          className="bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
        >
          {saving ? "Mise à jour…" : "Mettre à jour"}
        </button>
      </div>
    </div>
  );
}
