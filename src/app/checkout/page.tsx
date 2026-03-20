"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryMethod, notes, setNotes, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "CASH">("CARD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const sub = subtotal();
  const deliveryFee = deliveryMethod === "DELIVERY" ? (sub >= 50 ? 0 : 5) : 0;
  const total = sub + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate order creation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderId = `CM-${Date.now().toString(36).toUpperCase()}`;
    clearCart();
    router.push(`/order/${orderId}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-brand-brown/60 mb-4">Panye ou vid — ajoute kèk bagay!</p>
        <Link href="/traiteur" className="btn-primary inline-block">
          Ale nan Traiteur
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-brand-brown/60 hover:text-brand-brown mb-6">
        <ArrowLeft size={16} />
        Retounen nan panye
      </Link>

      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Summary */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Rezime Kòmand</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.nameCreole}
                  {item.sizeLabel && ` (${item.sizeLabel})`}
                </span>
                <span className="font-semibold">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-brand-red">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Enfòmasyon Ou</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-brand-brown/70 block mb-1">
                Non / Nom
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                placeholder="Marie Jean-Baptiste"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-brown/70 block mb-1">
                Telefòn / Téléphone
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                placeholder="+509 XXXX-XXXX"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-brand-brown/70 block mb-1">
                Imèl / Email
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                placeholder="marie@email.com"
              />
            </div>
            {deliveryMethod === "DELIVERY" && (
              <div>
                <label className="text-sm font-medium text-brand-brown/70 block mb-1">
                  Adrès Livrezon / Adresse de livraison
                </label>
                <textarea
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
                  rows={2}
                  placeholder="Rue, quartier, ville..."
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Mòd Pèman / Mode de paiement</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("CARD")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === "CARD"
                  ? "border-brand-blue bg-brand-blue/5"
                  : "border-gray-200 hover:border-brand-blue/50"
              }`}
            >
              <CreditCard size={24} />
              <span className="font-semibold text-sm">Kat / Carte</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                paymentMethod === "CASH"
                  ? "border-brand-blue bg-brand-blue/5"
                  : "border-gray-200 hover:border-brand-blue/50"
              }`}
            >
              <Banknote size={24} />
              <span className="font-semibold text-sm">Cash</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">Nòt espesyal / Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue outline-none transition-all"
            rows={2}
            placeholder="Instructions spéciales pour votre commande..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isProcessing}
          className="btn-accent w-full text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span>Ap trete kòmand ou...</span>
          ) : (
            <span>Pase Kòmand — {formatPrice(total)}</span>
          )}
        </button>
      </form>
    </div>
  );
}
