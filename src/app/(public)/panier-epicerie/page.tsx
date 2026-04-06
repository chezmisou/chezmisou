import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Récapitulatif de votre panier",
};

export default function PanierEpiceriePage() {
  return (
    <section className="flex items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="max-w-lg">
        <h1 className="font-serif text-4xl text-marron-profond mb-4">
          R&eacute;capitulatif de votre panier
        </h1>
        <p className="font-sans text-text-body leading-relaxed mb-8">
          Le checkout complet arrive au prochain lot.
          En attendant, retrouvez vos articles dans le tiroir panier.
        </p>
        <Link
          href="/epicerie"
          className="inline-block px-8 py-4 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
        >
          Retour &agrave; l&rsquo;&eacute;picerie
        </Link>
      </div>
    </section>
  );
}
