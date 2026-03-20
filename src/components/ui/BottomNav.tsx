"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Lakay" },
  { href: "/traiteur", icon: Search, label: "Rechech" },
  { href: "/cart", icon: ShoppingCart, label: "Panye" },
  { href: "/account", icon: User, label: "Kont mwen" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          const isCart = href === "/cart";

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                isActive ? "text-brand-red" : "text-gray-500"
              )}
            >
              <span className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-brand-red text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {itemCount}
                  </span>
                )}
              </span>
              <span className={cn("font-medium", isActive && "font-bold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
