"use client";

import { useState } from "react";
import { toast } from "sonner";

interface Props {
  quoteId: string;
  initialNotes: string;
}

export default function AdminNotes({ quoteId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/devis/${quoteId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: notes }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success("Notes sauvegardées");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        placeholder="Notes internes sur cette demande…"
        className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50 text-sm"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder les notes"}
      </button>
    </div>
  );
}
