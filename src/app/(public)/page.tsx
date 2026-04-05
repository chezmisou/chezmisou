export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-blanc-creme px-4">
      <h1 className="font-serif text-5xl font-bold text-marron-profond md:text-7xl">
        Hello Lakay
      </h1>
      <p className="mt-4 font-sans text-xl text-orange md:text-2xl">
        Chez Misou · Manje Lakay
      </p>
      <p className="mt-2 text-sm text-gris-chaud">
        Lot 0 — Fondations OK
      </p>
      <button
        disabled
        className="mt-8 rounded-lg bg-orange px-6 py-3 font-sans font-semibold text-white transition-colors hover:bg-orange-vif disabled:cursor-not-allowed disabled:opacity-60"
      >
        Bientôt disponible
      </button>
    </main>
  );
}
