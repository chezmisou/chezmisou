"use client";

import { Sunrise } from "lucide-react";
import { useLacCart } from "@/lib/cart/LacCartContext";

export default function LacCartButton() {
  const { totalItems, openCart } = useLacCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-lg text-marron-profond hover:bg-marron-profond/10 transition-colors"
      aria-label="Ouvrir le panier LAC"
    >
      <Sunrise size={22} />
      <span className="absolute -top-1 -right-1 bg-orange text-blanc text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
        {totalItems}
      </span>
    </button>
  );
}
