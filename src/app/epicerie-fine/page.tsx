"use client";

import { useEffect, useState } from "react";
import { useEpicerieCartStore, EpicerieCartItem } from "@/stores/epicerie-cart-store";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: string;
  nameFr: string;
  nameCr: string;
  category: string;
  size: string;
  price: number;
  image: string;
  isActive: boolean;
  categoryInfo: {
    labelFr: string;
    labelCr: string;
    accentColor: string;
  };
}

const FILTERS = [
  { key: "ALL", labelFr: "Tout", labelCr: "Tout" },
  { key: "EPIS", labelFr: "Épices", labelCr: "Epis" },
  { key: "PIMENT", labelFr: "Piments", labelCr: "Piman" },
  { key: "KREMAS", labelFr: "Krémas", labelCr: "Krémas" },
];

export default function EpicerieFinePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [showCart, setShowCart] = useState(false);

  const cart = useEpicerieCartStore();

  useEffect(() => {
    fetch("/api/epicerie-fine/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered =
    activeFilter === "ALL"
      ? products
      : products.filter((p) => p.category === activeFilter);

  const handleAddToCart = (product: Product) => {
    cart.addItem({
      productId: product.id,
      nameFr: product.nameFr,
      nameCr: product.nameCr,
      size: product.size,
      image: product.image,
      quantity: 1,
      unitPrice: product.price,
      category: product.category,
      accentColor: product.categoryInfo.accentColor,
    });
  };

  const cartItemCount = cart.itemCount();
  const cartSubtotal = cart.subtotal();

  return (
    <div className="min-h-screen" style={{ background: "#FAF6F0" }}>
      {/* Hero Banner */}
      <header
        className="relative overflow-hidden"
        style={{ background: "#2C1810" }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, #D4A017 0%, transparent 50%), radial-gradient(circle at 80% 50%, #C0392B 0%, transparent 50%)",
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
            style={{ fontFamily: "Playfair Display, Georgia, serif" }}
          >
            Saveurs Authentiques
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl italic"
            style={{ color: "#D4A017", fontFamily: "Georgia, serif" }}
          >
            Épices, piments &amp; krémas — dirèk lakay ou
          </motion.p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeFilter === f.key ? "#2C1810" : "white",
                color: activeFilter === f.key ? "#D4A017" : "#5C3A28",
                boxShadow: activeFilter === f.key
                  ? "0 4px 12px rgba(44, 24, 16, 0.3)"
                  : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {f.labelFr}
              {f.key !== "ALL" && (
                <span className="ml-1 opacity-60 italic"> / {f.labelCr}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="text-xl" style={{ color: "#5C3A28" }}>
              Chargement des produits...
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  background: "white",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                {/* Category Badge */}
                <div className="relative px-5 pt-5">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: `${product.categoryInfo.accentColor}18`,
                      color: product.categoryInfo.accentColor,
                    }}
                  >
                    {product.categoryInfo.labelFr} / {product.categoryInfo.labelCr}
                  </span>
                </div>

                {/* Image/Emoji */}
                <div className="flex items-center justify-center py-6">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {product.image}
                  </span>
                </div>

                {/* Product Info */}
                <div className="px-5 pb-5">
                  <h3
                    className="text-lg font-bold leading-tight"
                    style={{ color: "#2C1810", fontFamily: "Playfair Display, Georgia, serif" }}
                  >
                    {product.nameFr}
                  </h3>
                  <p
                    className="italic text-sm mt-0.5"
                    style={{ color: "#5C3A28", fontFamily: "Georgia, serif" }}
                  >
                    {product.nameCr}
                  </p>

                  {/* Size */}
                  <span
                    className="inline-block mt-2 px-2.5 py-0.5 rounded-md text-xs"
                    style={{
                      background: "#FAF6F0",
                      color: "#8E6F47",
                    }}
                  >
                    {product.size}
                  </span>

                  {/* Price + Add to Cart */}
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className="text-2xl font-bold"
                      style={{
                        color: product.categoryInfo.accentColor,
                        fontFamily: "Playfair Display, Georgia, serif",
                      }}
                    >
                      {product.price.toFixed(2)}€
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all hover:scale-105 active:scale-95"
                      style={{ background: product.categoryInfo.accentColor }}
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: "#5C3A28" }}>
              Aucun produit dans cette catégorie.
            </p>
          </div>
        )}
      </main>

      {/* Fixed Cart Bar */}
      <AnimatePresence>
        {cartItemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
              background: "#2C1810",
              boxShadow: "0 -4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <div className="max-w-6xl mx-auto px-4 py-3">
              {/* Expanded Cart View */}
              <AnimatePresence>
                {showCart && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-4 space-y-3 max-h-60 overflow-y-auto">
                      {cart.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                        >
                          <span className="text-2xl">{item.image}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {item.nameFr}
                            </p>
                            <p className="text-xs italic" style={{ color: "#D4A017" }}>
                              {item.nameCr} — {item.size}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ background: "rgba(255,255,255,0.15)" }}
                            >
                              −
                            </button>
                            <span className="text-white text-sm font-mono w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => cart.updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold"
                              style={{ background: "rgba(255,255,255,0.15)" }}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold ml-2" style={{ color: item.accentColor }}>
                            {(item.unitPrice * item.quantity).toFixed(2)}€
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cart Summary Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="flex items-center gap-3"
                >
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: "#D4A017", color: "#2C1810" }}
                  >
                    {cartItemCount}
                  </span>
                  <span className="text-white text-sm">
                    {showCart ? "Masquer le panier" : "Voir le panier"}
                  </span>
                </button>

                <div className="flex items-center gap-4">
                  <span className="text-white font-bold text-lg">
                    {cartSubtotal.toFixed(2)}€
                  </span>
                  <button
                    className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                    style={{ background: "#D4A017", color: "#2C1810" }}
                  >
                    Commander / Kòmande
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed cart bar */}
      {cartItemCount > 0 && <div className="h-20" />}

      {/* Footer */}
      <footer className="py-8 text-center" style={{ background: "#2C1810" }}>
        <p className="text-sm" style={{ color: "#8E6F47" }}>
          Chez Misou — Épicerie Fine
        </p>
        <p className="text-xs italic mt-1" style={{ color: "#5C3A28" }}>
          Savè otantik, dirèk lakay ou
        </p>
      </footer>
    </div>
  );
}
