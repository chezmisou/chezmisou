"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blanc-creme px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-widest text-orange mb-4">
          Erreur 500
        </p>
        <h1 className="font-serif text-5xl text-marron-profond mb-4">
          Oups, quelque chose a br&ucirc;l&eacute;
        </h1>
        <p className="text-text-body mb-8">
          Une erreur inattendue est survenue. Rassurez-vous, Misou s&rsquo;en occupe.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-block px-6 py-3 rounded-xl bg-orange text-white font-semibold hover:bg-orange-vif transition-colors"
          >
            R&eacute;essayer
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl border-2 border-marron-profond text-marron-profond font-semibold hover:bg-marron-profond hover:text-white transition-colors"
          >
            Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
