"use client";

import { useState } from "react";
import type { Decimal } from "@prisma/client/runtime/library";

type Variant = {
  id: string;
  name: string;
  price: Decimal;
  stock: number;
};

type Props = {
  variants: Variant[];
  onAdd: (variantId: string, quantity: number) => void;
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function ProductVariantSelector({ variants, onAdd }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const selected = variants[selectedIndex];
  const price = Number(selected.price);
  const stock = selected.stock;
  const isOutOfStock = stock === 0;

  return (
    <div className="space-y-6">
      {/* Variant selector */}
      {variants.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {variants.map((v, i) => (
            <button
              key={v.id}
              onClick={() => {
                setSelectedIndex(i);
                setQuantity(1);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === selectedIndex
                  ? "bg-orange text-white"
                  : "bg-blanc-creme text-marron-profond hover:bg-orange/10"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Single variant display */}
      {variants.length === 1 && (
        <p className="text-text-body font-body">{selected.name}</p>
      )}

      {/* Price */}
      <p className="font-playfair text-3xl text-marron-profond">
        {priceFormatter.format(price)}
      </p>

      {/* Stock indicator */}
      <p className="text-sm font-medium">
        {stock > 5 && (
          <span className="text-green-600">En stock</span>
        )}
        {stock >= 1 && stock <= 5 && (
          <span className="text-orange">Plus que {stock} en stock</span>
        )}
        {stock === 0 && (
          <span className="text-red-600">Épuisé</span>
        )}
      </p>

      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={isOutOfStock}
          className="w-10 h-10 rounded-full border border-marron-profond/20 flex items-center justify-center text-lg font-medium text-marron-profond hover:bg-blanc-creme transition-colors disabled:opacity-40"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => {
            const val = Math.max(1, Math.min(10, Number(e.target.value) || 1));
            setQuantity(val);
          }}
          disabled={isOutOfStock}
          className="w-14 h-10 text-center border border-marron-profond/20 rounded-lg font-body text-marron-profond disabled:opacity-40"
        />
        <button
          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          disabled={isOutOfStock}
          className="w-10 h-10 rounded-full border border-marron-profond/20 flex items-center justify-center text-lg font-medium text-marron-profond hover:bg-blanc-creme transition-colors disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* Add to cart */}
      <button
        onClick={() => onAdd(selected.id, quantity)}
        disabled={isOutOfStock}
        className="w-full py-4 rounded-xl bg-orange text-white font-semibold text-lg hover:bg-orange-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Ajouter au panier
      </button>

      <p className="text-xs text-text-body/70 text-center">
        Stock limité · Livraison sous 3-5 jours
      </p>
    </div>
  );
}
