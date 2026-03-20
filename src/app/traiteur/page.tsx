"use client";

import { useState } from "react";
import { SAMPLE_PRODUCTS, CATEGORIES, type ProductCategory } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";
import ProductDetailModal from "@/components/shop/ProductDetailModal";
import { type Product } from "@/lib/data";

export default function TraiteurPage() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "ALL">("ALL");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered =
    activeCategory === "ALL"
      ? SAMPLE_PRODUCTS
      : SAMPLE_PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Traiteur</h1>
        <p className="text-brand-brown/60 mt-2">
          Cocottes, sauces, grillades et plus — pour votre quotidien et vos événements
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
            activeCategory === "ALL"
              ? "bg-brand-blue text-white"
              : "bg-white text-brand-brown border border-brand-brown/20 hover:border-brand-blue"
          }`}
        >
          Tout
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeCategory === cat.id
                ? "bg-brand-blue text-white"
                : "bg-white text-brand-brown border border-brand-brown/20 hover:border-brand-blue"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((product) => (
          <div key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-brand-brown/50 text-lg">Aucun produit dans cette catégorie</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
