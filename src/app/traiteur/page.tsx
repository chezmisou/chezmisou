"use client";

import { useState, useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SizeKey = "petit" | "moyen" | "grand";

interface SizeOption {
  key: SizeKey;
  label: string;
  persons: number;
  price: number;
}

interface Dish {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: "entrees" | "accompagnements" | "plats";
  sizes: SizeOption[];
}

interface CartItem {
  dishId: string;
  sizeKey: SizeKey;
  quantity: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "entrees" as const, label: "Entrées", emoji: "🥟" },
  { id: "accompagnements" as const, label: "Accompagnements", emoji: "🍚" },
  { id: "plats" as const, label: "Plats Principaux", emoji: "🍗" },
];

function makeSizes(petit: number, moyen: number, grand: number): SizeOption[] {
  return [
    { key: "petit", label: "Petit", persons: 10, price: petit },
    { key: "moyen", label: "Moyen", persons: 15, price: moyen },
    { key: "grand", label: "Grand", persons: 20, price: grand },
  ];
}

const DISHES: Dish[] = [
  {
    id: "pates",
    name: "Pâtés",
    description: "Fourrés viande épicée ou morue, croustillants et dorés",
    emoji: "🥟",
    category: "entrees",
    sizes: makeSizes(40, 55, 70),
  },
  {
    id: "riz-blanc",
    name: "Riz Blanc",
    description: "Riz nature parfumé, accompagnement classique",
    emoji: "🍚",
    category: "accompagnements",
    sizes: makeSizes(35, 50, 65),
  },
  {
    id: "riz-djon-djon",
    name: "Riz Djon Djon",
    description: "Riz aux champignons noirs haïtiens, saveur unique",
    emoji: "🍄",
    category: "accompagnements",
    sizes: makeSizes(50, 70, 90),
  },
  {
    id: "diri-kole",
    name: "Diri Kolé ak Pwa",
    description: "Riz collé aux haricots rouges, plat traditionnel",
    emoji: "🫘",
    category: "accompagnements",
    sizes: makeSizes(45, 65, 80),
  },
  {
    id: "legumes",
    name: "Légumes / Legim",
    description: "Ragoût d'aubergine, chou et épinards mijotés",
    emoji: "🥬",
    category: "accompagnements",
    sizes: makeSizes(55, 75, 95),
  },
  {
    id: "poulet",
    name: "Poulet",
    description: "Mariné aux épices créoles, grillé ou en sauce",
    emoji: "🍗",
    category: "plats",
    sizes: makeSizes(70, 100, 130),
  },
  {
    id: "boeuf",
    name: "Bœuf",
    description: "Mijoté lentement en sauce créole",
    emoji: "🥩",
    category: "plats",
    sizes: makeSizes(85, 120, 155),
  },
  {
    id: "poisson",
    name: "Poisson / Vivaneau",
    description: "Frit ou grillé, accompagné de sauce ti-malice",
    emoji: "🐟",
    category: "plats",
    sizes: makeSizes(95, 135, 175),
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SIZE_COLORS: Record<SizeKey, { bg: string; text: string; border: string; badge: string }> = {
  petit: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
    badge: "bg-amber-500",
  },
  moyen: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
    badge: "bg-blue-500",
  },
  grand: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/30",
    badge: "bg-pink-500",
  },
};

function getDish(id: string): Dish | undefined {
  return DISHES.find((d) => d.id === id);
}

function getSize(dish: Dish, key: SizeKey): SizeOption | undefined {
  return dish.sizes.find((s) => s.key === key);
}

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `${price}€` : `${price.toFixed(2)}€`;
}

function formatPricePerPerson(price: number, persons: number): string {
  const pp = price / persons;
  return `${pp.toFixed(2)}€/pers.`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TraiteurPage() {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "entrees" | "accompagnements" | "plats"
  >("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Filtered dishes
  const filteredDishes = useMemo(
    () =>
      activeCategory === "all"
        ? DISHES
        : DISHES.filter((d) => d.category === activeCategory),
    [activeCategory]
  );

  // Cart helpers
  const addToCart = (dishId: string, sizeKey: SizeKey) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.dishId === dishId && item.sizeKey === sizeKey
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { dishId, sizeKey, quantity: 1 }];
    });
  };

  const removeFromCart = (dishId: string, sizeKey: SizeKey) => {
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.dishId === dishId && item.sizeKey === sizeKey
      );
      if (idx < 0) return prev;
      const next = [...prev];
      if (next[idx].quantity <= 1) {
        next.splice(idx, 1);
      } else {
        next[idx] = { ...next[idx], quantity: next[idx].quantity - 1 };
      }
      return next;
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce((sum, item) => {
    const dish = getDish(item.dishId);
    if (!dish) return sum;
    const size = getSize(dish, item.sizeKey);
    if (!size) return sum;
    return sum + size.price * item.quantity;
  }, 0);

  const totalPersons = cart.reduce((sum, item) => {
    const dish = getDish(item.dishId);
    if (!dish) return sum;
    const size = getSize(dish, item.sizeKey);
    if (!size) return sum;
    return sum + size.persons * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #1a1008 0%, #0d0a06 50%, #1a1008 100%)" }}>
      {/* ── Sticky Nav ─────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-amber-900/30"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(26,16,8,0.85)" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-amber-400 font-bold text-lg tracking-wide">
            ★ Chez Misou — Traiteur
          </span>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300"
            style={{ backgroundColor: totalItems > 0 ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.05)", border: totalItems > 0 ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.1)" }}
          >
            <span className="text-lg">🛒</span>
            <span className="text-sm" style={{ color: totalItems > 0 ? "#6EE7B7" : "#FFF8F0" }}>
              Panier
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="text-center py-12 px-4">
        <p className="text-amber-400 text-sm font-semibold tracking-[0.3em] uppercase mb-2">
          ★ Service Traiteur ★
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: "#FDE68A" }}
        >
          Saveurs d&apos;Haïti
        </h1>
        <p className="max-w-xl mx-auto text-base" style={{ color: "rgba(255,248,240,0.6)" }}>
          Cuisine authentique haïtienne pour vos événements. Choisissez vos
          plats, la taille et régalez vos invités.
        </p>
      </header>

      {/* ── Size Legend ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div
          className="rounded-xl p-4 flex flex-wrap items-center justify-center gap-6"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "#FFF8F0" }}>
            Tailles&nbsp;:
          </span>
          {(
            [
              { key: "petit" as SizeKey, label: "Petit", persons: 10 },
              { key: "moyen" as SizeKey, label: "Moyen", persons: 15 },
              { key: "grand" as SizeKey, label: "Grand", persons: 20 },
            ] as const
          ).map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${SIZE_COLORS[s.key].badge}`}
              />
              <span className={`text-sm font-medium ${SIZE_COLORS[s.key].text}`}>
                {s.label}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,248,240,0.4)" }}>
                ({s.persons} pers.)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category Filters ───────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <FilterButton
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            🍽️ Tout le Menu
          </FilterButton>
          {CATEGORIES.map((cat) => (
            <FilterButton
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.emoji} {cat.label}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* ── Dishes ─────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 pb-32">
        {activeCategory === "all"
          ? CATEGORIES.map((cat) => {
              const dishes = DISHES.filter((d) => d.category === cat.id);
              return (
                <section key={cat.id} className="mb-12">
                  <h2
                    className="text-2xl font-bold mb-6 flex items-center gap-2"
                    style={{ color: "#FDE68A" }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {dishes.map((dish) => (
                      <DishCard
                        key={dish.id}
                        dish={dish}
                        onAdd={addToCart}
                      />
                    ))}
                  </div>
                </section>
              );
            })
          : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} onAdd={addToCart} />
              ))}
            </div>
          )}
      </main>

      {/* ── Cart Panel ─────────────────────────────────────────────── */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setCartOpen(false)}
          />
          <div
            className="fixed top-0 right-0 h-full z-[70] w-full max-w-md overflow-y-auto"
            style={{
              backgroundColor: "#1a1008",
              borderLeft: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.5)",
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: "#6EE7B7" }}>
                  🛒 Votre Panier
                </h2>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-center py-12" style={{ color: "rgba(255,248,240,0.4)" }}>
                  Votre panier est vide
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => {
                      const dish = getDish(item.dishId);
                      if (!dish) return null;
                      const size = getSize(dish, item.sizeKey);
                      if (!size) return null;
                      const subtotal = size.price * item.quantity;
                      return (
                        <div
                          key={`${item.dishId}-${item.sizeKey}`}
                          className="rounded-lg p-3 flex items-center gap-3"
                          style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          <span className="text-2xl">{dish.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "#FFF8F0" }}>
                              {dish.name}
                            </p>
                            <p className="text-xs" style={{ color: "rgba(255,248,240,0.5)" }}>
                              <span className={SIZE_COLORS[item.sizeKey].text}>
                                {size.label}
                              </span>
                              {" · "}
                              {size.persons} pers. · {formatPrice(size.price)}/unité
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item.dishId, item.sizeKey)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                              style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#F87171", border: "1px solid rgba(239,68,68,0.3)" }}
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm font-bold" style={{ color: "#FFF8F0" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item.dishId, item.sizeKey)}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                              style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.3)" }}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm font-bold min-w-[50px] text-right" style={{ color: "#6EE7B7" }}>
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div
                    className="rounded-xl p-4 space-y-3"
                    style={{ backgroundColor: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
                  >
                    <div className="flex justify-between text-sm" style={{ color: "rgba(255,248,240,0.6)" }}>
                      <span>Articles</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: "rgba(255,248,240,0.6)" }}>
                      <span>Personnes servies (est.)</span>
                      <span>~{totalPersons} pers.</span>
                    </div>
                    <div
                      className="flex justify-between items-center pt-3 text-lg font-bold"
                      style={{ borderTop: "1px solid rgba(16,185,129,0.2)", color: "#6EE7B7" }}
                    >
                      <span>Total</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  <button
                    className="w-full mt-6 py-3 rounded-xl text-white font-bold text-base transition-all duration-300 hover:brightness-110"
                    style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
                  >
                    Commander
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Floating Bar ───────────────────────────────────────────── */}
      {totalItems > 0 && !cartOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.95), rgba(5,150,105,0.95))",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(110,231,183,0.3)",
          }}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🛒</span>
              <span className="text-white font-semibold text-sm">
                {totalItems} article{totalItems > 1 ? "s" : ""}
              </span>
              <span className="text-emerald-100 text-sm">·</span>
              <span className="text-white font-bold text-sm">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={() => setCartOpen(true)}
              className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: "white", color: "#059669" }}
            >
              Voir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
      style={
        active
          ? {
              background: "linear-gradient(135deg, #D97706, #F59E0B)",
              color: "#1a1008",
              boxShadow: "0 4px 15px rgba(245,158,11,0.3)",
            }
          : {
              backgroundColor: "rgba(255,255,255,0.05)",
              color: "rgba(255,248,240,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }
      }
    >
      {children}
    </button>
  );
}

function DishCard({
  dish,
  onAdd,
}: {
  dish: Dish;
  onAdd: (dishId: string, sizeKey: SizeKey) => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
      }}
    >
      {/* Dish info */}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-3xl">{dish.emoji}</span>
        <div>
          <h3 className="text-lg font-bold" style={{ color: "#FFF8F0" }}>
            {dish.name}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,248,240,0.5)" }}>
            {dish.description}
          </p>
        </div>
      </div>

      {/* Size options */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {dish.sizes.map((size) => {
          const colors = SIZE_COLORS[size.key];
          return (
            <div
              key={size.key}
              className={`rounded-xl p-3 flex items-center justify-between ${colors.bg} border ${colors.border}`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${colors.badge}`} />
                  <span className={`text-sm font-semibold ${colors.text}`}>
                    {size.label}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,248,240,0.4)" }}>
                  {size.persons} personnes
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-base font-bold" style={{ color: "#FFF8F0" }}>
                    {formatPrice(size.price)}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,248,240,0.4)" }}>
                    {formatPricePerPerson(size.price, size.persons)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onAdd(dish.id, size.key)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 hover:scale-110"
                style={{
                  backgroundColor: "rgba(16,185,129,0.15)",
                  color: "#6EE7B7",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                +
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
