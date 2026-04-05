import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "L\u2019\u00e9picerie fine",
  description:
    "Bient\u00f4t, notre s\u00e9lection de produits authentiques ha\u00eftiens. \u00c9pices, piments, confitures et kr\u00e9mas.",
};

export default function EpiceriePage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blanc-creme via-blanc-chaud to-jaune-clair/20 px-4">
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-6">
          Bient&ocirc;t disponible
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-marron-profond mb-6">
          L&rsquo;&eacute;picerie fine
        </h1>
        <p className="text-lg md:text-xl text-text-body font-sans leading-relaxed max-w-lg mx-auto">
          Bient&ocirc;t, notre s&eacute;lection de produits authentiques ha&iuml;tiens.
        </p>
        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-marron-profond text-marron-profond font-sans font-semibold hover:bg-marron-profond hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-marron-profond focus:ring-offset-2"
          aria-label="Retour \u00e0 l\u2019accueil"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Retour \u00e0 l&rsquo;accueil
        </Link>
      </div>
    </section>
  );
}
