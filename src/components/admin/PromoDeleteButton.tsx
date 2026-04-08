"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PromoDeleteButton({
  promoId,
  promoCode,
  hasRedemptions,
}: {
  promoId: string;
  promoCode: string;
  hasRedemptions: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promos/${promoId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }

      toast.success(`Code « ${promoCode} » supprimé`);
      router.refresh();
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (hasRedemptions) {
    return (
      <button
        onClick={() =>
          toast.error(
            "Ce code a déjà été utilisé, il ne peut plus être supprimé. Désactive-le plutôt."
          )
        }
        className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
        title="Suppression impossible — code déjà utilisé"
      >
        <Trash2 size={16} />
      </button>
    );
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : "Oui"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-2 rounded-lg text-gris-chaud hover:text-red-600 hover:bg-red-50 transition-colors"
      title="Supprimer"
    >
      <Trash2 size={16} />
    </button>
  );
}
