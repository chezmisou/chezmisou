import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Nous écrire",
  description:
    "Pour toute question, devis ou commande particulière, écrivez-nous. Contact Chez Misou — Manje Lakay.",
};

export default function ContactPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blanc-creme via-blanc-chaud to-jaune-clair/20 px-4">
      <div className="max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-6">
          Contact
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-marron-profond mb-6">
          Nous &eacute;crire
        </h1>
        <p className="text-lg md:text-xl text-text-body font-sans leading-relaxed max-w-lg mx-auto">
          Pour toute question, devis ou commande particuli&egrave;re, &eacute;crivez-nous &agrave;
        </p>
        <a
          href="mailto:contact@chezmisou.com"
          className="mt-6 inline-flex items-center gap-2 text-orange font-sans font-semibold text-xl hover:text-orange-vif transition-colors duration-200"
          aria-label="Envoyer un email à contact@chezmisou.com"
        >
          <Mail size={22} aria-hidden="true" />
          contact@chezmisou.com
        </a>
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-marron-profond text-marron-profond font-sans font-semibold hover:bg-marron-profond hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-marron-profond focus:ring-offset-2"
            aria-label="Retour à l’accueil"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Retour à l&rsquo;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
