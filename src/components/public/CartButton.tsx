"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

export default function CartButton() {
  const { totalItems, openCart } = useCart();

  return (
    <button
      onClick={openCart}
      className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      aria-label="Ouvrir le panier"
    >
      <ShoppingBag size={22} />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-brand-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </button>
  );
}
