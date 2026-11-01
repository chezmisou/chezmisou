"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Check, Loader2, MessageCircle, X } from "lucide-react";

const MOODS = [
  { value: "bien", emoji: "😀", label: "Content" },
  { value: "bof", emoji: "😐", label: "Mitigé" },
  { value: "pas_bien", emoji: "🙁", label: "Pas content" },
] as const;

/**
 * Bouton « Un retour ? » présent sur toutes les pages publiques :
 * un message, un ressenti et un email facultatif, sans compte.
 */
export default function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // champ piège anti-robots
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    setOpen(false);
    if (sent) {
      setSent(false);
      setMood(null);
      setMessage("");
      setEmail("");
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < 3) {
      setError("Écrivez quelques mots avant d'envoyer.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, mood, website, page: pathname, source: "site" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Envoi impossible. Réessayez.");
        return;
      }
      setSent(true);
    } catch {
      setError("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setSending(false);
    }
  }

  // Au-dessus de la barre fixe du traiteur sur mobile
  const lifted = pathname?.startsWith("/traiteur");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`fixed left-4 z-40 flex items-center gap-2 rounded-full bg-marron-profond text-blanc-creme pl-3 pr-4 py-2.5 text-sm font-sans font-semibold shadow-lg hover:bg-marron transition-colors ${
          lifted ? "bottom-20 lg:bottom-4" : "bottom-4"
        }`}
        aria-haspopup="dialog"
      >
        <MessageCircle size={18} aria-hidden="true" />
        Un retour ?
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-marron-profond/40" onClick={close} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            className="relative w-full sm:max-w-md bg-blanc rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 font-sans"
          >
            <button
              type="button"
              onClick={close}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gris-chaud hover:bg-blanc-creme"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center">
                  <Check size={28} className="text-green-700" />
                </div>
                <h2 id="feedback-title" className="font-serif text-2xl text-marron-profond mb-2">
                  Mèsi anpil !
                </h2>
                <p className="text-text-body text-sm">Votre retour a bien été envoyé à Misou.</p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 px-6 py-2.5 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <form onSubmit={submit}>
                <h2 id="feedback-title" className="font-serif text-2xl text-marron-profond mb-1 pr-8">
                  Un retour ?
                </h2>
                <p className="text-sm text-gris-chaud mb-4">
                  Une idée, un souci, un compliment : dites-le-nous.
                </p>

                <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Votre ressenti">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      role="radio"
                      aria-checked={mood === m.value}
                      onClick={() => setMood(mood === m.value ? null : m.value)}
                      className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all ${
                        mood === m.value
                          ? "border-orange bg-orange/5"
                          : "border-marron-profond/10 hover:border-marron-profond/30"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden="true">{m.emoji}</span>
                      <span className="text-xs text-text-body">{m.label}</span>
                    </button>
                  ))}
                </div>

                <label htmlFor="feedback-message" className="sr-only">
                  Votre message
                </label>
                <textarea
                  id="feedback-message"
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setError("");
                  }}
                  rows={4}
                  maxLength={3000}
                  placeholder="Votre message…"
                  className="w-full px-4 py-3 rounded-xl border border-marron-profond/20 outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 resize-none"
                />

                <label htmlFor="feedback-email" className="block text-sm text-text-body mt-3 mb-1">
                  Email <span className="text-gris-chaud">(facultatif, si vous voulez une réponse)</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  autoComplete="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-marron-profond/20 outline-none focus:border-orange focus:ring-1 focus:ring-orange/30"
                />

                {/* Champ piège invisible pour les robots */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="mt-4 w-full py-3 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {sending && <Loader2 size={18} className="animate-spin" />}
                  Envoyer
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
