"use client";

import { useState } from "react";
import { X, Minus, Plus, Flame } from "lucide-react";
import { Product, SPICE_LEVELS, EXTRAS } from "@/lib/data";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState("mwayen");
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  const basePrice = product.price * (selectedSize?.priceMultiplier || 1);
  const extrasTotal = selectedExtras.reduce((sum, id) => {
    const extra = EXTRAS.find((e) => e.id === id);
    return sum + (extra?.price || 0);
  }, 0);
  const unitPrice = basePrice + extrasTotal;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (id: string) => {
    setSelectedExtras((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      nameCreole: product.nameCreole,
      image: product.image,
      sizeId: selectedSize?.id,
      sizeLabel: selectedSize?.label,
      quantity,
      unitPrice,
      customizations: {
        spiceLevel,
        extras: selectedExtras,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl md:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center"
        >
          <X size={18} />
        </button>

        {/* Product image placeholder */}
        <div className="aspect-video bg-brand-gold/30 flex items-center justify-center">
          <span className="font-display text-4xl font-bold text-brand-brown/30">
            {product.nameCreole}
          </span>
        </div>

        <div className="p-6">
          <h2 className="font-display text-2xl font-bold">{product.nameCreole}</h2>
          <p className="text-sm text-brand-brown/50 mb-1">{product.name}</p>
          <p className="text-brand-brown/70 text-sm mb-6">{product.description}</p>

          {/* Size Selection */}
          {product.sizes.length > 1 && (
            <div className="mb-6">
              <h3 className="font-semibold text-sm mb-3">Taille / Gwosè</h3>
              <div className="grid gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                      selectedSize?.id === size.id
                        ? "border-brand-blue bg-brand-blue/5"
                        : "border-gray-200 hover:border-brand-blue/50"
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-sm">{size.labelCreole}</span>
                      <span className="text-xs text-brand-brown/50 ml-2">
                        ({size.servings})
                      </span>
                    </div>
                    <span className="font-bold text-brand-red">
                      {formatPrice(product.price * size.priceMultiplier)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-1">
              <Flame size={16} className="text-brand-red" />
              Niveau pike / Niveau épicé
            </h3>
            <div className="flex gap-2 flex-wrap">
              {SPICE_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSpiceLevel(level.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    spiceLevel === level.id
                      ? "bg-brand-red text-white"
                      : "bg-gray-100 text-brand-brown hover:bg-gray-200"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Extras</h3>
            <div className="grid gap-2">
              {EXTRAS.map((extra) => (
                <button
                  key={extra.id}
                  onClick={() => toggleExtra(extra.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                    selectedExtras.includes(extra.id)
                      ? "border-brand-green bg-brand-green/5"
                      : "border-gray-200 hover:border-brand-green/50"
                  }`}
                >
                  <span className="text-sm font-medium">{extra.label}</span>
                  <span className="text-sm text-brand-brown/70">
                    +{formatPrice(extra.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-6">
            <span className="font-semibold text-sm">Kantite / Quantité</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-blue transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-lg w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-blue transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="w-full btn-accent text-center flex items-center justify-center gap-2"
          >
            <span>Ajoute nan Panye</span>
            <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm">
              {formatPrice(totalPrice)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
