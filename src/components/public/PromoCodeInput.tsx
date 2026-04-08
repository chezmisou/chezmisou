"use client";

import { useState } from "react";
import { Loader2, Tag, X } from "lucide-react";

interface PromoItem {
  variantId?: string;
  lacDishId?: string;
  productId?: string;
  quantity: number;
  price: number;
}

interface AppliedPromo {
  code: string;
  discountAmount: number;
  promoCodeId: string;
}

interface PromoCodeInputProps {
  type: "epicerie" | "lac";
  items: PromoItem[];
  subtotal: number;
  customerEmail?: string;
  onApply: (result: AppliedPromo) => void;
  onRemove: () => void;
}

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function PromoCodeInput({
  type,
  items,
  subtotal,
  customerEmail,
  onApply,
  onRemove,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<AppliedPromo | null>(null);

  async function handleApply() {
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), type, items, subtotal, customerEmail }),
      });

      const data = await res.json();

      if (!data.valid) {
        setError(data.error || "Code invalide");
        return;
      }

      const result: AppliedPromo = {
        code: data.code,
        discountAmount: data.discountAmount,
        promoCodeId: data.promoCodeId,
      };

      setApplied(result);
      onApply(result);
    } catch {
      setError("Impossible de vérifier le code");
    } finally {
      setLoading(false);
    }
  }

  function handleRemove() {
    setApplied(null);
    setCode("");
    setError("");
    onRemove();
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-green-600" />
          <span className="text-sm font-semibold text-green-700">
            Code {applied.code} appliqué
          </span>
          <span className="text-sm text-green-600">
            · –{priceFormatter.format(applied.discountAmount)}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 rounded-lg text-green-600 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Retirer le code promo"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (error) setError("");
          }}
          className="flex-1 px-4 py-2.5 rounded-xl border border-marron-profond/20 outline-none transition-all focus:border-orange focus:ring-1 focus:ring-orange/30 font-mono uppercase text-sm"
          placeholder="Code promo"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 rounded-xl bg-marron-profond text-blanc text-sm font-semibold hover:bg-marron transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Appliquer"
          )}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5">{error}</p>
      )}
    </div>
  );
}
