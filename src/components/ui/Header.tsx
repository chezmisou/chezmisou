"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Search, Menu, X, Home, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <header className="sticky top-0 z-50 bg-brand-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-sm tracking-[0.2em] uppercase font-body">
            Chez Misou
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-brand-gold transition-colors">
            Lakay
          </Link>
          <Link href="/traiteur" className="hover:text-brand-gold transition-colors">
            Traiteur
          </Link>
          <Link href="/lunch-after-church" className="hover:text-brand-gold transition-colors">
            Lunch After Church
          </Link>
          <Link href="/epicerie-fine" className="hover:text-brand-gold transition-colors">
            Épicerie Fine
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full cart-badge-animate">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/20 bg-brand-blue pb-4">
          <nav className="flex flex-col px-4 py-2 gap-1">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Home size={18} />
              Lakay
            </Link>
            <Link
              href="/traiteur"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Search size={18} />
              Traiteur
            </Link>
            <Link
              href="/lunch-after-church"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">⛪</span>
              Lunch After Church
            </Link>
            <Link
              href="/epicerie-fine"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-lg">🫙</span>
              Épicerie Fine
            </Link>
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ShoppingCart size={18} />
              Panye {itemCount > 0 && `(${itemCount})`}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
