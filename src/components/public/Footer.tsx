import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

const navLinks = [
  { label: "Chez Misou", href: "/" },
  { label: "Lakay", href: "/#histoire" },
  { label: "Épicerie", href: "/epicerie" },
  { label: "Traiteur", href: "/traiteur" },
  { label: "Lunch After Church", href: "/lac" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-marron-profond text-blanc-creme">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Colonne 1 : Marque */}
          <div>
            <Image
              src="/logo-chez-misou.png"
              alt="Logo Chez Misou — Manje Lakay"
              width={64}
              height={64}
              className="h-16 w-auto mb-4"
            />
            <p className="font-serif text-lg text-blanc-creme/90">
              Chez Misou &middot; Manje Lakay
            </p>
            <p className="mt-2 text-sm text-blanc-creme/60 italic leading-relaxed">
              Manje lakay, partout o&ugrave; vous &ecirc;tes.
            </p>
          </div>

          {/* Colonne 2 : Navigation */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-orange mb-4">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2" aria-label="Navigation du pied de page">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  className="text-sm text-blanc-creme/70 hover:text-orange transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/mes-commandes"
                aria-label="Mes commandes"
                className="text-sm text-blanc-creme/70 hover:text-orange transition-colors duration-200"
              >
                Mes commandes
              </Link>
            </nav>
          </div>

          {/* Colonne 3 : Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-orange mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-3 text-sm text-blanc-creme/70">
              <a
                href="mailto:contact@chezmisou.com"
                className="flex items-center gap-2 hover:text-orange transition-colors duration-200"
                aria-label="Envoyer un email à contact@chezmisou.com"
              >
                <Mail size={16} />
                contact@chezmisou.com
              </a>
              <div className="flex items-center gap-4 mt-2">
                <a
                  href="#"
                  aria-label="Suivez-nous sur Instagram"
                  className="p-2 rounded-full bg-blanc-creme/10 hover:bg-orange/20 hover:text-orange transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Suivez-nous sur Facebook"
                  className="p-2 rounded-full bg-blanc-creme/10 hover:bg-orange/20 hover:text-orange transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Barre séparatrice + mentions */}
        <div className="border-t border-blanc-creme/15 mt-10 pt-8">
          <p className="text-center text-sm text-blanc-creme/50">
            &copy; 2026 Chez Misou &mdash; Manje Lakay. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-blanc-creme/40">
            <a href="#" className="hover:text-blanc-creme/70 transition-colors" aria-label="Mentions légales">
              Mentions l&eacute;gales
            </a>
            <span>&middot;</span>
            <a href="#" className="hover:text-blanc-creme/70 transition-colors" aria-label="Conditions générales de vente">
              CGV
            </a>
            <span>&middot;</span>
            <a href="#" className="hover:text-blanc-creme/70 transition-colors" aria-label="Politique de confidentialité">
              Confidentialit&eacute;
            </a>
            <span>&middot;</span>
            <Link href="/admin/login" className="hover:text-orange transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
