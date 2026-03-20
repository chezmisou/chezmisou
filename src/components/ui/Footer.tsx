import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-brown text-brand-cream">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">Chez Misou</h3>
            <p className="font-accent text-lg text-brand-gold mb-4">
              Lakay ou, nan chak bouch
            </p>
            <p className="text-sm text-brand-cream/70">
              Saveurs authentiques d&apos;Haïti, préparées avec amour et livrées chez vous.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Navigation</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/" className="hover:text-brand-gold transition-colors">
                Lakay (Accueil)
              </Link>
              <Link href="/traiteur" className="hover:text-brand-gold transition-colors">
                Traiteur
              </Link>
              <Link href="/lunch-after-church" className="hover:text-brand-gold transition-colors">
                Lunch After Church
              </Link>
              <Link href="/cart" className="hover:text-brand-gold transition-colors">
                Panye (Panier)
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Kontakte Nou</h4>
            <div className="flex flex-col gap-2 text-sm text-brand-cream/70">
              <p>Tel: +509 XXXX-XXXX</p>
              <p>Email: info@chezmisou.com</p>
              <p>Port-au-Prince, Haïti</p>
            </div>
          </div>
        </div>

        <div className="border-t border-brand-cream/20 mt-8 pt-8 text-center text-sm text-brand-cream/50">
          <p>&copy; {new Date().getFullYear()} Chez Misou. Tout dwa rezève.</p>
        </div>
      </div>
    </footer>
  );
}
