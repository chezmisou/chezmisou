"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { User as UserIcon, LogOut, Package, UserCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function getInitial(user: User | null): string {
  if (!user) return "";
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    (metadata.firstName as string | undefined) ??
    (metadata.first_name as string | undefined) ??
    (typeof metadata.given_name === "string"
      ? (metadata.given_name as string)
      : undefined) ??
    (typeof metadata.name === "string"
      ? (metadata.name as string).split(" ")[0]
      : undefined);
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (user.email) return user.email.charAt(0).toUpperCase();
  return "?";
}

export default function UserMenu({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        setLoaded(true);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoaded(true);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  if (variant === "mobile") {
    if (!loaded) return null;

    if (!user) {
      return (
        <Link
          href="/connexion"
          onClick={onNavigate}
          className="flex items-center gap-3 py-3 px-4 rounded-xl font-sans text-base text-marron-profond hover:text-orange hover:bg-orange/5 transition-colors"
        >
          <UserIcon size={18} />
          Se connecter
        </Link>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="px-4 py-2 text-xs text-gris-chaud uppercase tracking-wide">
          Mon espace
        </div>
        <Link
          href="/compte"
          onClick={onNavigate}
          className="flex items-center gap-3 py-3 px-4 rounded-xl font-sans text-base text-marron-profond hover:text-orange hover:bg-orange/5 transition-colors"
        >
          <UserCircle size={18} />
          Mon compte
        </Link>
        <Link
          href="/mes-commandes"
          onClick={onNavigate}
          className="flex items-center gap-3 py-3 px-4 rounded-xl font-sans text-base text-marron-profond hover:text-orange hover:bg-orange/5 transition-colors"
        >
          <Package size={18} />
          Mes commandes
        </Link>
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void handleSignOut();
          }}
          className="flex items-center gap-3 py-3 px-4 rounded-xl font-sans text-base text-marron-profond hover:text-orange hover:bg-orange/5 transition-colors text-left"
        >
          <LogOut size={18} />
          Se déconnecter
        </button>
      </div>
    );
  }

  if (!loaded) {
    return <div className="w-9 h-9" aria-hidden="true" />;
  }

  if (!user) {
    return (
      <Link
        href="/connexion"
        aria-label="Se connecter"
        className="p-2 rounded-lg text-marron-profond hover:bg-marron-profond/10 transition-colors focus:outline-none focus:ring-2 focus:ring-orange"
      >
        <UserIcon size={22} />
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu utilisateur"
        className={cn(
          "w-9 h-9 rounded-full bg-orange text-blanc font-semibold flex items-center justify-center",
          "hover:bg-orange-vif transition-colors focus:outline-none focus:ring-2 focus:ring-orange"
        )}
      >
        {getInitial(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-blanc rounded-xl shadow-lg border border-marron-doux/20 overflow-hidden z-50"
        >
          <div className="px-4 py-3 border-b border-marron-doux/10">
            <p className="text-xs text-gris-chaud">Connecté en tant que</p>
            <p className="text-sm text-marron-profond font-medium truncate">
              {user.email}
            </p>
          </div>
          <Link
            href="/compte"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-marron-profond hover:bg-blanc-creme hover:text-orange transition-colors"
            role="menuitem"
          >
            <UserCircle size={16} />
            Mon compte
          </Link>
          <Link
            href="/mes-commandes"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-marron-profond hover:bg-blanc-creme hover:text-orange transition-colors"
            role="menuitem"
          >
            <Package size={16} />
            Mes commandes
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-marron-profond hover:bg-blanc-creme hover:text-orange transition-colors text-left border-t border-marron-doux/10"
            role="menuitem"
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
