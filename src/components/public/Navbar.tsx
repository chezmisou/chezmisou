"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import CartButton from "@/components/public/CartButton";
import LacCartButton from "@/components/public/LacCartButton";

const navLinks = [
  { label: "Chez Misou", href: "/", ariaLabel: "Accueil Chez Misou" },
  { label: "Lakay", href: "/#histoire", ariaLabel: "Notre histoire" },
  { label: "Épicerie", href: "/epicerie", ariaLabel: "Épicerie fine" },
  { label: "Traiteur", href: "/traiteur", ariaLabel: "Service traiteur" },
  { label: "Lunch After Church", href: "/lac", ariaLabel: "Lunch After Church" },
  { label: "Contact", href: "/contact", ariaLabel: "Nous contacter" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-shadow duration-300",
        "bg-blanc-creme/95 backdrop-blur-md",
        scrolled && "shadow-md"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" aria-label="Accueil Chez Misou" className="flex-shrink-0">
          <Image
            src="/logo-chez-misou.png"
            alt="Logo Chez Misou — Manje Lakay"
            width={48}
            height={48}
            priority
            className="h-12 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.ariaLabel}
              className={cn(
                "font-sans text-sm tracking-wide transition-colors duration-200 relative",
                "after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-orange after:transition-all after:duration-300 hover:after:w-full",
                isActive(link.href)
                  ? "text-orange font-semibold"
                  : "text-marron-profond hover:text-orange"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Cart buttons */}
          <CartButton />
          <LacCartButton />

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-marron-profond hover:bg-marron-profond/10 transition-colors focus:outline-none focus:ring-2 focus:ring-orange"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-marron-profond/40 z-40 transition-opacity duration-300 lg:hidden",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-blanc-creme z-50 shadow-2xl",
          "transform transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navigation"
      >
        <div className="flex items-center justify-between p-4 border-b border-marron-profond/10">
          <Image
            src="/logo-chez-misou.png"
            alt="Logo Chez Misou"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-marron-profond hover:bg-marron-profond/10 transition-colors focus:outline-none focus:ring-2 focus:ring-orange"
            aria-label="Fermer le menu"
          >
            <X size={22} />
          </button>
        </div>
        <nav className="flex flex-col p-4 gap-1" aria-label="Navigation mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.ariaLabel}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "py-3 px-4 rounded-xl font-sans text-base transition-colors duration-200",
                isActive(link.href)
                  ? "text-orange font-semibold bg-orange/10"
                  : "text-marron-profond hover:text-orange hover:bg-orange/5"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
