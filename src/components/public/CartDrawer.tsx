"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart/CartContext";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    isOpen,
    closeCart,
  } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const freeShipping = subtotal >= 60;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-marron-profond/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="absolute right-0 top-0 h-full w-full max-w-md bg-blanc shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-marron-profond/10">
          <h2 className="font-serif text-xl text-marron-profond">
            Votre panier
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-blanc-creme rounded-lg transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={20} className="text-marron-profond" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <p className="text-text-body text-lg">Votre panier est vide</p>
              <Link
                href="/epicerie"
                onClick={closeCart}
                className="px-6 py-3 bg-orange text-blanc rounded-xl font-semibold hover:bg-orange-vif transition-colors"
              >
                D&eacute;couvrir l&rsquo;&eacute;picerie
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-blanc-creme rounded-xl p-3"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-marron-profond truncate">
                    {item.productName}
                  </p>
                  <p className="text-xs text-text-body">{item.variantName}</p>
                  <p className="text-sm font-semibold text-marron-profond mt-1">
                    {priceFormatter.format(item.price)}
                  </p>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-text-body/60 hover:text-red-500 transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-full border border-marron-profond/20 text-xs flex items-center justify-center hover:bg-blanc transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="text-sm w-6 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.min(10, item.quantity + 1)
                        )
                      }
                      className="w-6 h-6 rounded-full border border-marron-profond/20 text-xs flex items-center justify-center hover:bg-blanc transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-marron-profond/10 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-body">Sous-total</span>
              <span className="font-semibold text-marron-profond">
                {priceFormatter.format(subtotal)}
              </span>
            </div>
            <p className="text-xs text-text-body/70">
              {freeShipping
                ? "Livraison offerte !"
                : "Frais de port calculés à l'étape suivante"}
            </p>
            <Link
              href="/checkout/epicerie"
              onClick={closeCart}
              className="block w-full py-3 rounded-xl bg-orange text-blanc font-semibold text-center hover:bg-orange-vif transition-colors"
            >
              Passer commande
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
