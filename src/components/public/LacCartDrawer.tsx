"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Utensils } from "lucide-react";
import { useLacCart } from "@/lib/cart/LacCartContext";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

interface MenuInfo {
  serviceDate: string;
  orderDeadline: string;
}

export default function LacCartDrawer() {
  const {
    items,
    currentMenuId,
    removeItem,
    updateQuantity,
    subtotal,
    isOpen,
    closeCart,
  } = useLacCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const [menuInfo, setMenuInfo] = useState<MenuInfo | null>(null);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  // Fetch menu info when drawer opens
  useEffect(() => {
    if (!currentMenuId || !isOpen) return;
    fetch(`/api/lac/menu/${currentMenuId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setMenuInfo(data);
          setDeadlinePassed(new Date() > new Date(data.orderDeadline));
        }
      })
      .catch(() => {});
  }, [currentMenuId, isOpen]);

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

  const serviceDateLabel = menuInfo
    ? new Date(menuInfo.serviceDate).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;

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
          <div>
            <h2 className="font-serif text-xl text-marron-profond">
              Votre commande LAC
            </h2>
            {serviceDateLabel && (
              <span className="inline-block mt-1 text-xs font-sans bg-orange/10 text-orange px-2 py-0.5 rounded-full capitalize">
                {serviceDateLabel}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-blanc-creme rounded-lg transition-colors"
            aria-label="Fermer le panier"
          >
            <X size={20} className="text-marron-profond" />
          </button>
        </div>

        {/* Deadline warning */}
        {deadlinePassed && items.length > 0 && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-xs font-sans font-semibold text-red-700">
              Les commandes sont fermées pour ce dimanche. Votre panier a été conservé mais vous ne pouvez plus payer.
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-6">
              <p className="text-text-body text-lg font-sans">
                Votre panier LAC est vide
              </p>
              <Link
                href="/lac"
                onClick={closeCart}
                className="px-6 py-3 bg-orange text-blanc rounded-xl font-semibold hover:bg-orange-vif transition-colors font-sans"
              >
                Découvrir le menu
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-blanc-creme rounded-xl p-3"
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-blanc">
                  {item.dishPhoto ? (
                    <Image
                      src={item.dishPhoto}
                      alt={item.dishName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Utensils size={20} className="text-gris-chaud/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-marron-profond truncate">
                    {item.dishName}
                  </p>
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
                    <span className="text-sm w-6 text-center font-medium font-sans">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
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
            <div className="flex justify-between text-sm font-sans">
              <span className="text-text-body">Sous-total</span>
              <span className="font-semibold text-marron-profond">
                {priceFormatter.format(subtotal)}
              </span>
            </div>
            <p className="text-xs text-text-body/70 font-sans">
              Frais selon mode de livraison choisi au checkout
            </p>
            {deadlinePassed ? (
              <button
                disabled
                className="block w-full py-3 rounded-xl bg-gray-300 text-gray-500 font-semibold text-center cursor-not-allowed font-sans"
              >
                Commandes fermées
              </button>
            ) : (
              <Link
                href="/checkout/lac"
                onClick={closeCart}
                className="block w-full py-3 rounded-xl bg-orange text-blanc font-semibold text-center hover:bg-orange-vif transition-colors font-sans"
              >
                Passer commande
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
