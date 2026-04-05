import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, UtensilsCrossed, Sun, ChevronDown, ArrowRight } from "lucide-react";

const activities = [
  {
    title: "\u00c9picerie fine",
    description:
      "Garnissez vos placards d\u2019\u00e9pices, de piments, de confitures et du fameux kr\u00e9mas \u2014 le tr\u00e9sor liquide d\u2019Ha\u00efti.",
    href: "/epicerie",
    icon: ShoppingBag,
  },
  {
    title: "Traiteur",
    description:
      "Offrez \u00e0 vos invit\u00e9s un repas qui ne ressemble \u00e0 aucun autre. Anniversaires, f\u00eates de famille, plateaux repas.",
    href: "/traiteur",
    icon: UtensilsCrossed,
  },
  {
    title: "Lunch After Church",
    description:
      "Le rendez-vous du dimanche\u00a0: un menu pr\u00e9par\u00e9 chaque semaine avec amour, \u00e0 retirer ou \u00e0 se faire livrer.",
    href: "/lac",
    icon: Sun,
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Section A \u2014 Hero */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-blanc-creme via-blanc-chaud to-jaune-clair/30">
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-8">
            \u00c9picerie &middot; Traiteur &middot; Lunch After Church
          </p>

          <h1 className="font-serif text-5xl md:text-7xl font-bold text-marron-profond leading-tight">
            Le go\u00fbt d&rsquo;<em className="italic text-orange">Ha\u00efti</em>,
            <br />
            comme \u00e0{" "}
            <em className="italic text-orange">la maison</em>.
          </h1>

          <p className="mt-8 text-lg md:text-xl text-text-body max-w-2xl mx-auto font-sans leading-relaxed">
            Manje lakay, c&rsquo;est plus qu&rsquo;un repas. C&rsquo;est une m&eacute;moire, une
            odeur qui r&eacute;veille, un souvenir qu&rsquo;on croyait perdu. Chez Misou, on vous
            le rend.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/epicerie"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange text-white font-sans font-semibold text-base hover:bg-orange-vif transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
              aria-label="D\u00e9couvrir l\u2019\u00e9picerie"
            >
              D&eacute;couvrir l&rsquo;&eacute;picerie
            </Link>
            <a
              href="#histoire"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-marron-profond text-marron-profond font-sans font-semibold text-base hover:bg-marron-profond hover:text-white transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-marron-profond focus:ring-offset-2"
              aria-label="D\u00e9couvrir notre histoire"
            >
              Notre histoire
            </a>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow text-marron-doux">
            <ChevronDown size={28} aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* Section B \u2014 Histoire de Misou */}
      <section id="histoire" className="bg-blanc-creme py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Photo */}
            <div className="relative flex justify-center">
              {/* Decorative circle behind photo */}
              <div className="absolute top-4 -left-4 w-72 h-72 md:w-96 md:h-96 rounded-full bg-orange/10" aria-hidden="true" />
              <div className="relative">
                <Image
                  src="/misou-portrait.jpg"
                  alt="Misou, fondatrice de Chez Misou, en blazer bordeaux"
                  width={480}
                  height={600}
                  priority
                  className="relative z-10 rounded-3xl shadow-2xl object-cover w-full max-w-md"
                />
              </div>
            </div>

            {/* Texte */}
            <div>
              <p className="text-orange uppercase tracking-[0.2em] text-sm font-sans font-medium mb-4">
                L&rsquo;histoire
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-marron-profond font-bold mb-8">
                Qui est Misou&nbsp;?
              </h2>

              <div className="space-y-5 text-text-body font-sans leading-relaxed text-base md:text-lg">
                <p>
                  Ha\u00eftienne expatri\u00e9e en France, Misou a emport\u00e9 avec elle quelque chose
                  qui ne tient dans aucune valise&nbsp;: le go\u00fbt de son \u00eele. Celui des
                  \u00e9pices qui embaument la cuisine de sa m\u00e8re, des piments qui br\u00fblent juste
                  ce qu&rsquo;il faut, du kr\u00e9mas qu&rsquo;on partage les soirs de f\u00eate &mdash;
                  ce tr\u00e9sor liquide d&rsquo;Ha\u00efti.
                </p>
                <p>
                  Loin du pays, elle a vu combien ces saveurs manquaient \u00e0 celles et ceux qui,
                  comme elle, avaient fait le voyage. Et combien elles restaient inconnues de ceux
                  qui n&rsquo;avaient jamais pos\u00e9 le pied sur la Perle des Antilles.
                </p>
                <p>
                  Alors Misou a d\u00e9cid\u00e9 de faire passerelle. De rapprocher ce qui est loin, de
                  faire d\u00e9couvrir ce qui m\u00e9rite de l&rsquo;\u00eatre.{" "}
                  <strong>Chez Misou &mdash; Manje Lakay</strong>, c&rsquo;est cette promesse&nbsp;:
                  qu&rsquo;o\u00f9 que vous soyez, il y ait toujours une place \u00e0 table pour un peu
                  d&rsquo;Ha\u00efti.
                </p>
              </div>

              {/* Slogan d\u00e9cor\u00e9 */}
              <div className="mt-10 pl-6 border-l-4 border-orange">
                <p className="font-serif italic text-2xl text-orange leading-snug">
                  Manje lakay, partout o\u00f9 vous \u00eates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section C \u2014 Les 3 activit\u00e9s */}
      <section className="relative bg-marron-profond py-20 md:py-28 overflow-hidden">
        {/* Subtle decorative overlay */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle at 2px 2px, #D4A017 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-blanc-creme text-4xl md:text-5xl font-bold">
              Trois fa\u00e7ons de vous ramener au pays
            </h2>
            <p className="mt-4 text-marron-doux font-sans text-lg max-w-2xl mx-auto">
              Que vous cherchiez des produits authentiques, un traiteur pour vos \u00e9v\u00e9nements ou
              un repas du dimanche pr\u00e9par\u00e9 avec amour, Misou est l\u00e0.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {activities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.href}
                  className="bg-blanc-creme rounded-2xl shadow-xl p-8 md:p-10 flex flex-col items-center text-center hover:scale-105 transition-transform duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-orange/15 flex items-center justify-center mb-6">
                    <Icon size={28} className="text-orange" aria-hidden="true" />
                  </div>
                  <h3 className="font-serif text-2xl text-marron-profond font-bold mb-3">
                    {activity.title}
                  </h3>
                  <p className="font-sans text-text-body leading-relaxed mb-6">
                    {activity.description}
                  </p>
                  <Link
                    href={activity.href}
                    className="inline-flex items-center gap-1 text-orange font-sans font-semibold hover:gap-2 transition-all duration-200"
                    aria-label={`D\u00e9couvrir ${activity.title}`}
                  >
                    D\u00e9couvrir <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section D \u2014 CTA final */}
      <section className="bg-blanc-creme py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-5xl text-marron-profond font-bold leading-tight">
            Une question&nbsp;?
            <br />
            Un \u00e9v\u00e9nement \u00e0 organiser&nbsp;?
          </h2>
          <p className="mt-6 text-text-body font-sans text-lg max-w-xl mx-auto">
            N&rsquo;h\u00e9sitez pas \u00e0 nous contacter pour toute demande de devis, commande
            particulière ou simple question. Misou sera ravie de vous r\u00e9pondre.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange text-white font-sans font-semibold text-base hover:bg-orange-vif transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2"
            aria-label="Nous contacter"
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </div>
  );
}
