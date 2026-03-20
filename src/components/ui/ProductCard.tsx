"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Product, DEFAULT_SIZES } from "@/lib/data";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameCreole: product.nameCreole,
      image: product.image,
      sizeId: product.sizes[0]?.id,
      sizeLabel: product.sizes[0]?.label,
      quantity: 1,
      unitPrice: product.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 800);
  };

  // Category color coding
  const categoryColors: Record<string, string> = {
    RIZ: "bg-brand-gold",
    SAUCES: "bg-brand-red",
    VIANDES: "bg-brand-brown",
    BOISSONS: "bg-brand-green",
    EPICES: "bg-orange-500",
  };

  const abbreviation = product.nameCreole
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  if (compact) {
    return (
      <div className="card p-4 flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-lg ${categoryColors[product.category] || "bg-gray-300"} flex items-center justify-center text-white font-bold text-sm`}
        >
          {abbreviation}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{product.nameCreole}</h4>
          <p className="text-xs text-brand-brown/60 truncate">{product.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-brand-red">{formatPrice(product.price)}</span>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              added
                ? "bg-brand-green text-white scale-110"
                : "bg-brand-red text-white hover:bg-red-700"
            }`}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card group">
      {/* Image placeholder with category color */}
      <div
        className={`aspect-square ${categoryColors[product.category] || "bg-gray-300"} flex items-center justify-center relative overflow-hidden`}
      >
        <span className="text-white/90 font-display text-3xl font-bold tracking-wider">
          {abbreviation}
        </span>
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-brand-brown font-bold px-3 py-1 rounded-full text-sm">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-bold leading-tight">
          {product.nameCreole}
        </h3>
        <p className="text-sm text-brand-brown/60 mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-brand-red">
            {formatPrice(product.price)}
          </span>
          {product.available && (
            <button
              onClick={handleAdd}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                added
                  ? "bg-brand-green text-white scale-110"
                  : "bg-brand-red text-white hover:bg-red-700 hover:scale-105"
              }`}
              aria-label={`Ajouter ${product.name} au panier`}
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
