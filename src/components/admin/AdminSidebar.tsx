"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UtensilsCrossed,
  FileText,
  Users,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  {
    href: "/admin",
    label: "Tableau de bord",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/admin/produits", label: "Produits", icon: Package },
  { href: "/admin/commandes", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/clients", label: "Clients", icon: Users },
];

const futureItems = [
  { label: "Menus LAC", icon: UtensilsCrossed },
  { label: "Devis traiteur", icon: FileText },
  { label: "Codes promo", icon: Tag },
  { label: "Paramètres", icon: Settings },
];

export default function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-blanc-creme/10">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-chez-misou.png"
            alt="Chez Misou"
            width={40}
            height={40}
            className="rounded-full brightness-110"
          />
          <div>
            <span className="text-blanc-creme font-serif font-bold text-lg block leading-tight">
              Chez Misou
            </span>
            <span className="text-blanc-creme/60 text-xs">Administration</span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-orange text-blanc"
                  : "text-blanc-creme/80 hover:bg-marron hover:text-blanc-creme"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 pb-2 px-3">
          <span className="text-xs uppercase tracking-widest text-blanc-creme/40">
            Bientôt
          </span>
        </div>

        {futureItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blanc-creme/30 cursor-not-allowed"
            >
              <Icon size={20} />
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] bg-blanc-creme/10 px-2 py-0.5 rounded-full">
                Bientôt
              </span>
            </div>
          );
        })}
      </nav>

      {/* User / logout */}
      <div className="px-4 py-4 border-t border-blanc-creme/10">
        <p className="text-xs text-blanc-creme/50 truncate mb-2">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-blanc-creme/70 hover:text-blanc-creme transition-colors w-full px-2 py-2 rounded-lg hover:bg-marron"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-marron-profond flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/logo-chez-misou.png"
            alt="Chez Misou"
            width={32}
            height={32}
            className="rounded-full brightness-110"
          />
          <span className="text-blanc-creme font-serif font-bold text-sm">
            Chez Misou
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-blanc-creme p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 w-[280px] h-screen bg-marron-profond z-50 overflow-y-auto">
            {sidebarContent}
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-marron-profond fixed top-0 left-0 h-screen z-30 overflow-y-auto">
        {sidebarContent}
      </aside>
    </>
  );
}
