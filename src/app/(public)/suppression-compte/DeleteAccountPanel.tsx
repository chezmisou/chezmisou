"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountPanel() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null))
      .catch(() => setEmail(null));
  }, []);

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "La suppression n'a pas pu aboutir.");
        return;
      }
      await createClient().auth.signOut().catch(() => {});
      setDone(true);
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setDeleting(false);
    }
  }

  if (done) {
    return (
      <div className="p-6 rounded-2xl bg-green-50 border border-green-200 font-sans text-green-800">
        Votre compte a bien été supprimé. Merci d&rsquo;avoir cuisiné avec nous !
      </div>
    );
  }

  if (email === undefined) {
    return (
      <div className="flex items-center gap-2 text-gris-chaud font-sans text-sm">
        <Loader2 size={16} className="animate-spin" /> Chargement…
      </div>
    );
  }

  if (!email) {
    return (
      <div className="p-6 rounded-2xl bg-blanc border border-marron-profond/10 font-sans text-text-body">
        <p className="mb-4">Connectez-vous au compte à supprimer, puis revenez sur cette page.</p>
        <Link
          href="/connexion"
          className="inline-block px-6 py-3 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-blanc border border-red-200 font-sans">
      <p className="text-text-body mb-4">
        Compte connecté : <strong className="text-marron-profond">{email}</strong>
      </p>
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-red-300 text-red-700 font-semibold hover:bg-red-50 transition-colors"
        >
          <Trash2 size={18} />
          Supprimer mon compte
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-red-700 font-semibold">
            Confirmer la suppression définitive de votre compte ?
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-blanc font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
              Oui, supprimer définitivement
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="px-6 py-3 rounded-xl border border-marron-profond/20 text-marron-profond font-semibold hover:bg-blanc-creme transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
