"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, deliveryMethod, setDeliveryMethod, subtotal } =
    useCartStore();

  const sub = subtotal();
  const deliveryFee = deliveryMethod === "DELIVERY" ? (sub >= 50 ? 0 : 5) : 0;
  const total = sub + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingCart size={32} className="text-gray-400" />
        </div>
        <h1 className="font-display text-2xl font-bold mb-2">Panye ou vid</h1>
        <p className="text-brand-brown/60 mb-6">Votre panier est vide</p>
        <Link href="/traiteur" className="btn-primary inline-block">
          Ale nan Traiteur
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="section-title mb-6">Panye</h1>

      {/* Cart Items */}
      <div className="space-y-3 mb-8">
        {items.map((item) => (
          <div key={item.id} className="card p-4">
            <div className="flex gap-3">
              {/* Image placeholder */}
              <div className="w-16 h-16 rounded-lg bg-brand-gold/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand-brown/40">
                  {item.nameCreole.slice(0, 3).toUpperCase()}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{item.nameCreole}</h3>
                    {item.sizeLabel && (
                      <p className="text-xs text-brand-brown/50">{item.sizeLabel}</p>
                    )}
                    {item.customizations?.spiceLevel && (
                      <p className="text-xs text-brand-brown/50">
                        Pike: {item.customizations.spiceLevel}
                      </p>
                    )}
                    {item.customizations?.extras && item.customizations.extras.length > 0 && (
                      <p className="text-xs text-brand-brown/50">
                        +{item.customizations.extras.join(", ")}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-gray-400 hover:text-brand-red transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-blue transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-blue transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-bold text-brand-red">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Method */}
      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-3">Mode de livraison</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDeliveryMethod("DELIVERY")}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              deliveryMethod === "DELIVERY"
                ? "border-brand-blue bg-brand-blue/5"
                : "border-gray-200 hover:border-brand-blue/50"
            }`}
          >
            <span className="text-2xl block mb-1">🚗</span>
            <span className="font-semibold text-sm">Livraison</span>
            <span className="text-xs text-brand-brown/50 block">
              {sub >= 50 ? "Gratuit" : formatPrice(5)}
            </span>
          </button>
          <button
            onClick={() => setDeliveryMethod("PICKUP")}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              deliveryMethod === "PICKUP"
                ? "border-brand-blue bg-brand-blue/5"
                : "border-gray-200 hover:border-brand-blue/50"
            }`}
          >
            <span className="text-2xl block mb-1">📍</span>
            <span className="font-semibold text-sm">Pickup</span>
            <span className="text-xs text-brand-brown/50 block">Gratuit</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-brand-brown/70">Sous-total</span>
            <span className="font-semibold">{formatPrice(sub)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-brand-brown/70">Livraison</span>
            <span className="font-semibold">
              {deliveryFee === 0 ? "Gratuit" : formatPrice(deliveryFee)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold text-lg text-brand-red">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Link
        href="/checkout"
        className="btn-accent w-full text-center flex items-center justify-center gap-2 block"
      >
        Ale nan Checkout
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
