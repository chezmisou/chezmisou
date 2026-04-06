"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded-lg text-marron-profond hover:bg-marron-profond/10 transition-colors"
      aria-label="Ouvrir le panier"
    >
      <ShoppingBag size={22} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-orange text-blanc text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
}
