import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function TraiteurComingSoon() {
  return (
    <section className="relative bg-gradient-to-br from-marron-profond via-marron to-marron-profond text-blanc py-24 md:py-32 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-orange/20 flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed size={28} className="text-orange" aria-hidden="true" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-4">
          Bientôt disponible
        </p>
        <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
          Traiteur
        </h1>
        <p className="text-lg md:text-xl text-blanc-creme/80 font-sans leading-relaxed">
          Misou prépare son service traiteur pour vos anniversaires, fêtes
          familiales et plateaux repas. Encore un peu de patience&nbsp;!
        </p>
        <p className="mt-4 text-blanc-creme/70 font-sans">
          Un événement à organiser d&apos;ici là&nbsp;? N&apos;hésitez pas à
          nous écrire.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange text-white font-sans font-semibold hover:bg-orange-vif transition-all duration-200 active:scale-95"
        >
          Nous contacter
        </Link>
      </div>
    </section>
  );
}
