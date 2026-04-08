"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { useLacCart, consumeToast } from "@/lib/cart/LacCartContext";

interface Props {
  lacMenuId: string;
  lacDishId: string;
  dishName: string;
  dishPhoto: string | null;
  price: number;
  maxQuantity?: number | null;
  deadlinePassed: boolean;
}

export default function LacDishQuantitySelector({
  lacMenuId,
  lacDishId,
  dishName,
  dishPhoto,
  price,
  maxQuantity,
  deadlinePassed,
}: Props) {
  const { addItem, items, openCart } = useLacCart();
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const currentInCart =
    items
      .filter((i) => i.lacDishId === lacDishId)
      .reduce((sum, i) => sum + i.quantity, 0) || 0;

  const maxReached =
    maxQuantity != null && currentInCart + qty > maxQuantity;

  function handleAdd() {
    if (deadlinePassed || maxReached) return;
    addItem({
      lacMenuId,
      lacDishId,
      dishName,
      dishPhoto,
      price,
      quantity: qty,
    });

    const msg = consumeToast();
    if (msg) {
      setToast(msg);
      setTimeout(() => setToast(null), 4000);
    }

    setQty(1);
    openCart();
  }

  if (deadlinePassed) {
    return (
      <p className="text-sm font-sans text-red-600 font-medium mt-2">
        Commandes fermées
      </p>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {toast && (
        <div className="text-xs bg-orange/10 text-orange rounded-lg px-3 py-2 font-sans">
          {toast}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 border border-marron-profond/20 rounded-xl px-1">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blanc-creme transition-colors"
            aria-label="Diminuer la quantité"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-sans font-medium text-sm">
            {qty}
          </span>
          <button
            onClick={() => {
              const max = maxQuantity != null ? maxQuantity - currentInCart : 99;
              setQty((q) => Math.min(max, q + 1));
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blanc-creme transition-colors"
            aria-label="Augmenter la quantité"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          onClick={handleAdd}
          disabled={maxReached}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange text-blanc font-sans font-semibold text-sm hover:bg-orange-vif transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={16} />
          Ajouter
        </button>
      </div>
      {maxQuantity != null && (
        <p className="text-xs font-sans text-gris-chaud">
          {currentInCart > 0
            ? `${currentInCart} dans le panier — `
            : ""}
          {maxQuantity - currentInCart <= 5 && maxQuantity - currentInCart > 0
            ? `Plus que ${maxQuantity - currentInCart} portion${maxQuantity - currentInCart > 1 ? "s" : ""} disponible${maxQuantity - currentInCart > 1 ? "s" : ""}`
            : maxReached
              ? "Quantité maximale atteinte"
              : `${maxQuantity} portions disponibles`}
        </p>
      )}
    </div>
  );
}
