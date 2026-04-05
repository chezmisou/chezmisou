"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";

type Variant = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type Props = {
  product: {
    id: string;
    slug: string;
    name: string;
    imageUrl: string;
  };
  variants: Variant[];
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function ProductDetailClient({ product, variants }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addItem, openCart } = useCart();

  const selected = variants[selectedIndex];
  const isOutOfStock = selected.stock === 0;

  function handleAdd() {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selected.id,
      variantName: selected.name,
      price: selected.price,
      quantity,
      imageUrl: product.imageUrl,
    });
    openCart();
  }

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
                  ? "bg-orange text-blanc"
                  : "bg-blanc-creme text-marron-profond hover:bg-orange/10"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {variants.length === 1 && (
        <p className="text-text-body font-sans">{selected.name}</p>
      )}

      {/* Price */}
      <p className="font-serif text-3xl text-marron-profond">
        {priceFormatter.format(selected.price)}
      </p>

      {/* Stock */}
      <p className="text-sm font-medium">
        {selected.stock > 5 && (
          <span className="text-green-600">En stock</span>
        )}
        {selected.stock >= 1 && selected.stock <= 5 && (
          <span className="text-orange">
            Plus que {selected.stock} en stock
          </span>
        )}
        {selected.stock === 0 && (
          <span className="text-red-600">&Eacute;puis&eacute;</span>
        )}
      </p>

      {/* Quantity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={isOutOfStock}
          className="w-10 h-10 rounded-full border border-marron-profond/20 flex items-center justify-center text-lg font-medium text-marron-profond hover:bg-blanc-creme transition-colors disabled:opacity-40"
        >
          &minus;
        </button>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Math.min(10, Number(e.target.value) || 1)))
          }
          disabled={isOutOfStock}
          className="w-14 h-10 text-center border border-marron-profond/20 rounded-lg font-sans text-marron-profond disabled:opacity-40"
        />
        <button
          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          disabled={isOutOfStock}
          className="w-10 h-10 rounded-full border border-marron-profond/20 flex items-center justify-center text-lg font-medium text-marron-profond hover:bg-blanc-creme transition-colors disabled:opacity-40"
        >
          +
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={isOutOfStock}
        className="w-full py-4 rounded-xl bg-orange text-blanc font-semibold text-lg hover:bg-orange-vif transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Ajouter au panier
      </button>

      <p className="text-xs text-text-body/70 text-center">
        Stock limit&eacute; &middot; Livraison sous 3-5 jours
      </p>
    </div>
  );
}
