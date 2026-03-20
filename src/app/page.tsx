import Link from "next/link";
import { SAMPLE_PRODUCTS } from "@/lib/data";
import PopularProducts from "@/components/shop/PopularProducts";

export default function HomePage() {
  const featured = SAMPLE_PRODUCTS.filter((p) => p.featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-brand-blue text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 text-center relative z-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-3xl">🍲</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-4">
            Chez Misou
          </h1>
          <p className="font-accent text-xl md:text-2xl text-brand-gold mb-2">
            Lakay ou, nan chak bouch
          </p>
          <p className="text-white/70 text-sm md:text-base">
            Chez vous, dans chaque bouchée
          </p>
        </div>
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-blue/50" />
      </section>

      {/* Two Main Services */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Traiteur Card */}
          <Link href="/traiteur" className="block">
            <div className="bg-brand-green text-white rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                <span className="text-xl">🍲</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Traiteur
              </h2>
              <p className="text-white/80 mb-4">
                Cocottes, sauces, grillades &amp; plus
              </p>
              <span className="btn-gold inline-block text-sm">
                Commander &rsaquo;
              </span>
            </div>
          </Link>

          {/* Lunch After Church Card */}
          <Link href="/lunch-after-church" className="block">
            <div className="bg-brand-cream text-brand-brown rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-brand-brown/10">
              <div className="w-10 h-10 rounded-lg bg-brand-brown/10 flex items-center justify-center mb-4">
                <span className="text-xl">⛪</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
                Lunch After Church
              </h2>
              <p className="text-brand-brown/70 mb-4">
                Dimanche — livré après la messe
              </p>
              <span className="inline-flex items-center gap-2 text-brand-blue font-semibold">
                Voir le menu <span>&rsaquo;</span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Popular Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Populaires</h2>
          <Link
            href="/traiteur"
            className="text-brand-red font-semibold text-sm hover:underline"
          >
            Tout voir
          </Link>
        </div>
        <PopularProducts products={featured} />
      </section>

      {/* Lunch After Church Banner */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <Link href="/lunch-after-church" className="block">
          <div className="bg-brand-green text-white rounded-2xl p-6 md:p-8 flex items-center justify-between">
            <div>
              <p className="text-brand-gold text-xs font-semibold tracking-wider uppercase mb-1">
                Dimanche Prochain
              </p>
              <h3 className="font-display text-xl md:text-2xl font-bold mb-1">
                Menu Lunch After Church
              </h3>
              <p className="text-white/70 text-sm mb-3">
                Commandez avant samedi 20h
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Poulet créole
                </span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Diri kolé
                </span>
                <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                  Sos pwa
                </span>
              </div>
            </div>
            <div className="hidden md:flex w-16 h-16 rounded-full bg-white/20 items-center justify-center">
              <span className="text-3xl">⛪</span>
            </div>
          </div>
        </Link>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <h2 className="text-center section-title mb-10">Comment ça marche</h2>
        <div className="grid grid-cols-3 gap-4 md:gap-8 text-center">
          {[
            { step: "1", title: "Chwazi", subtitle: "Choisissez", color: "bg-brand-blue" },
            { step: "2", title: "Kòmande", subtitle: "Commandez", color: "bg-brand-red" },
            { step: "3", title: "Jwi", subtitle: "Dégustez", color: "bg-brand-green" },
          ].map(({ step, title, subtitle, color }) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`${color} text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-3`}
              >
                {step}
              </div>
              <h3 className="font-display font-bold text-lg">{title}</h3>
              <p className="text-sm text-brand-brown/60">{subtitle}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
