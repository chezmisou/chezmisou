"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";

export default function TraiteurAvailabilityToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !enabled;
    if (
      next &&
      !confirm(
        "Ouvrir la section Traiteur au public ? Les visiteurs pourront voir les plats et envoyer des demandes de devis."
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traiteur_enabled: String(next) }),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "Erreur lors de la sauvegarde");
        return;
      }

      setEnabled(next);
      toast.success(
        next
          ? "La section Traiteur est maintenant ouverte au public"
          : "La section Traiteur est repassée en « bientôt disponible »"
      );
      router.refresh();
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="font-serif text-lg font-bold text-marron-profond">
            Section Traiteur sur le site
          </h2>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              enabled
                ? "bg-green-100 text-green-700"
                : "bg-jaune-clair/60 text-marron-profond"
            }`}
          >
            {enabled ? "Ouverte" : "Bientôt disponible"}
          </span>
        </div>
        <p className="text-sm text-text-body mt-1">
          {enabled
            ? "Les visiteurs voient le catalogue et peuvent demander un devis."
            : "Les visiteurs voient une page « bientôt disponible ». Connectée en admin, vous voyez un aperçu de la page complète."}
        </p>
      </div>
      <button
        type="button"
        onClick={toggle}
        disabled={saving}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          enabled
            ? "border border-marron-profond/20 text-marron-profond hover:bg-blanc-creme"
            : "bg-orange text-blanc hover:bg-orange-vif"
        }`}
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : enabled ? (
          <Lock size={18} />
        ) : (
          <Unlock size={18} />
        )}
        {enabled ? "Repasser en « bientôt »" : "Débloquer le Traiteur"}
      </button>
    </div>
  );
}
