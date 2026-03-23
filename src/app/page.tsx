import Link from "next/link";

const services = [
  {
    title: "Lunch After Church",
    description: "Bon manje aprè legliz chak dimanch",
    href: "/lunch-after-church",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="w-16 h-16"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" fill="#FCD116" fillOpacity={0.2} />
        <path
          d="M20 38c0-6.627 5.373-12 12-12s12 5.373 12 12"
          stroke="#D21034"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="32" cy="40" rx="16" ry="4" fill="#A0522D" fillOpacity={0.3} />
        <path
          d="M28 26c-1-6 2-10 4-10s5 4 4 10"
          stroke="#2D6A4F"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="24" cy="34" r="2" fill="#D21034" />
        <circle cx="32" cy="32" r="2" fill="#FCD116" />
        <circle cx="40" cy="34" r="2" fill="#2D6A4F" />
      </svg>
    ),
    bg: "bg-gradient-to-br from-[#D21034] to-[#A0522D]",
    accent: "text-yellow-200",
  },
  {
    title: "Traiteur",
    description: "Fèt, maryaj, tout evènman ou yo",
    href: "/traiteur",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="w-16 h-16"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" fill="#FCD116" fillOpacity={0.2} />
        <rect x="16" y="34" width="32" height="8" rx="2" fill="#5C3D2E" fillOpacity={0.3} />
        <path
          d="M14 34h36"
          stroke="#A0522D"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M18 34c0-8 6-16 14-16s14 8 14 16"
          stroke="#D21034"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M32 18v-4M28 20l-2-3M36 20l2-3"
          stroke="#FCD116"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    bg: "bg-gradient-to-br from-[#2D6A4F] to-[#1a4030]",
    accent: "text-emerald-200",
  },
  {
    title: "Épicerie Fine",
    description: "Epis, piman, kremas ak plis ankò",
    href: "/epicerie-fine",
    icon: (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="w-16 h-16"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="28" fill="#FCD116" fillOpacity={0.2} />
        <rect x="22" y="20" width="12" height="24" rx="3" stroke="#A0522D" strokeWidth="2.5" />
        <rect x="22" y="20" width="12" height="8" rx="3" fill="#D21034" fillOpacity={0.3} />
        <path d="M26 28h4" stroke="#A0522D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="42" cy="36" r="6" stroke="#2D6A4F" strokeWidth="2" />
        <path
          d="M42 32v4M40 36h4"
          stroke="#2D6A4F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M38 22c2-3 6-3 8 0"
          stroke="#FCD116"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    bg: "bg-gradient-to-br from-[#D4A017] to-[#b8890f]",
    accent: "text-yellow-100",
  },
];

const placeholderReviews = [
  {
    name: "Marie-Claire",
    text: "Meilleur griot de tout Port-au-Prince ! Chak fwa m kòmande, se yon fèt nan bouch mwen.",
  },
  {
    name: "Jean-Baptiste",
    text: "Le traiteur pour notre mariage était parfait. Tout le monde a adoré le riz djondjon.",
  },
  {
    name: "Stéphanie",
    text: "Les épices sont incroyables, un vrai goût d'Haïti. Mwen pa ka viv san epis Chez Misou !",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#D21034] via-[#A0522D] to-[#3B2314] text-white">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD116] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2D6A4F] rounded-full blur-[100px] opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
            Chez Misou
          </h1>
          <p className="font-accent text-3xl md:text-4xl mt-4 text-[#FCD116]">
            Mangé lakay
          </p>
          <p className="mt-6 text-lg md:text-xl text-white/80 max-w-xl mx-auto">
            Saveurs authentiques d&apos;Haïti, préparées avec amour.
            Traiteur, repas du dimanche et épicerie fine.
          </p>
        </div>
      </section>

      {/* Service Cards */}
      <section className="max-w-5xl mx-auto w-full px-4 -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className={`${service.bg} rounded-2xl p-6 md:p-8 text-white shadow-lg
                transform transition-all duration-300
                hover:scale-[1.03] hover:shadow-2xl
                focus:outline-none focus:ring-4 focus:ring-[#FCD116]/50
                group`}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="transition-transform duration-300 group-hover:scale-110">
                  {service.icon}
                </div>
                <h2 className="font-display text-xl md:text-2xl font-bold">
                  {service.title}
                </h2>
                <p className={`text-sm md:text-base ${service.accent} opacity-90`}>
                  {service.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="max-w-5xl mx-auto w-full px-4 py-16 md:py-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-[#3B2314]">
            Sa kliyan nou yo di
          </h2>
          <p className="text-[#3B2314]/60 mt-2">
            Avis de nos clients
          </p>
        </div>

        {placeholderReviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {placeholderReviews.map((review) => (
              <div
                key={review.name}
                className="bg-white rounded-2xl shadow-md p-6 border border-[#FCD116]/20
                  hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#FCD116]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#3B2314]/80 text-sm leading-relaxed mb-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <p className="font-semibold text-[#A0522D]">{review.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-[#FCD116]/20">
            <p className="text-[#3B2314]/60 text-lg">
              Soyez le premier à donner votre avis !
            </p>
          </div>
        )}
      </section>

      {/* Admin link */}
      <div className="text-center pb-6">
        <Link
          href="/admin"
          className="text-xs text-[#3B2314]/30 hover:text-[#3B2314]/60 transition-colors"
        >
          Administration
        </Link>
      </div>
    </div>
  );
}
