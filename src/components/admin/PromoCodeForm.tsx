"use client";

import { useState, useEffect, type FormEvent } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
}

interface PromoCodeFormProps {
  initialData?: {
    id: string;
    code: string;
    description: string;
    discountType: "percentage" | "fixed_amount";
    discountValue: string;
    minOrderAmount: string;
    appliesTo: string;
    usageLimit: string;
    usageLimitPerCustomer: string;
    validFrom: string;
    validUntil: string;
    isActive: boolean;
    productIds: string[];
  };
  hasRedemptions?: boolean;
}

export default function PromoCodeForm({
  initialData,
  hasRedemptions = false,
}: PromoCodeFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [code, setCode] = useState(initialData?.code ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount">(
    initialData?.discountType ?? "percentage"
  );
  const [discountValue, setDiscountValue] = useState(initialData?.discountValue ?? "");
  const [minOrderAmount, setMinOrderAmount] = useState(initialData?.minOrderAmount ?? "");
  const [appliesTo, setAppliesTo] = useState(initialData?.appliesTo ?? "all");
  const [usageLimit, setUsageLimit] = useState(initialData?.usageLimit ?? "");
  const [usageLimitPerCustomer, setUsageLimitPerCustomer] = useState(
    initialData?.usageLimitPerCustomer ?? ""
  );
  const [validFrom, setValidFrom] = useState(initialData?.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(initialData?.validUntil ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialData?.productIds ?? []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appliesTo === "specific_products") {
      fetch("/api/admin/produits?active=true")
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setProducts(data);
          else if (data.products) setProducts(data.products);
        })
        .catch(() => {});
    }
  }, [appliesTo]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const normalizedCode = code.toUpperCase().trim();
    if (!normalizedCode) errs.code = "Le code est requis";
    else if (normalizedCode.length < 3 || normalizedCode.length > 20)
      errs.code = "Le code doit contenir entre 3 et 20 caractères";
    else if (!/^[A-Z0-9]+$/.test(normalizedCode))
      errs.code = "Le code ne doit contenir que des lettres et des chiffres";

    if (!discountValue || parseFloat(discountValue) <= 0)
      errs.discountValue = "La valeur doit être supérieure à 0";
    if (discountType === "percentage" && parseFloat(discountValue) > 100)
      errs.discountValue = "Le pourcentage ne peut pas dépasser 100";

    if (appliesTo === "specific_products" && selectedProductIds.length === 0)
      errs.productIds = "Sélectionnez au moins un produit";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        code: code.toUpperCase().trim(),
        description,
        discountType,
        discountValue,
        minOrderAmount: minOrderAmount || null,
        appliesTo,
        usageLimit: usageLimit || null,
        usageLimitPerCustomer: usageLimitPerCustomer || null,
        validFrom: validFrom || null,
        validUntil: validUntil || null,
        isActive,
        productIds: appliesTo === "specific_products" ? selectedProductIds : [],
      };

      const url = isEdit
        ? `/api/admin/promos/${initialData.id}`
        : "/api/admin/promos";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success(isEdit ? "Code promo mis à jour" : "Code promo créé");
      router.push("/admin/promos");
      router.refresh();
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/promos/${initialData!.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }
      toast.success("Code promo supprimé");
      router.push("/admin/promos");
      router.refresh();
    } catch {
      toast.error("Impossible de contacter le serveur");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  const inputClass = (field?: string) =>
    `w-full px-4 py-2.5 rounded-xl border outline-none transition-all font-sans ${
      field && errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-300"
        : "border-marron-profond/20 focus:border-orange focus:ring-1 focus:ring-orange/30"
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Code + Description */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Code *
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className={`${inputClass("code")} font-mono uppercase`}
            placeholder="LAKAY10"
            maxLength={20}
          />
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass()}
            rows={2}
            placeholder="Description interne (visible uniquement dans l'admin)"
          />
        </div>
      </div>

      {/* Discount type + value */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-body mb-3">
            Type de remise *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="discountType"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
                className="accent-orange"
              />
              <span className="text-sm text-text-body">Pourcentage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="discountType"
                value="fixed_amount"
                checked={discountType === "fixed_amount"}
                onChange={() => setDiscountType("fixed_amount")}
                className="accent-orange"
              />
              <span className="text-sm text-text-body">Montant fixe (€)</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Valeur *
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              max={discountType === "percentage" ? 100 : undefined}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className={inputClass("discountValue")}
              placeholder={discountType === "percentage" ? "15" : "10.00"}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gris-chaud text-sm">
              {discountType === "percentage" ? "%" : "€"}
            </span>
          </div>
          {errors.discountValue && (
            <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Montant minimum de commande (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={minOrderAmount}
            onChange={(e) => setMinOrderAmount(e.target.value)}
            className={inputClass()}
            placeholder="Optionnel"
          />
          <p className="text-xs text-gris-chaud mt-1">
            La commande doit atteindre ce montant pour appliquer le code. Laisse vide pour aucun minimum.
          </p>
        </div>
      </div>

      {/* Applies to */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            S&apos;applique &agrave; *
          </label>
          <select
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
            className={inputClass()}
          >
            <option value="all">Toutes les activités</option>
            <option value="epicerie">Épicerie uniquement</option>
            <option value="lac">Lunch After Church uniquement</option>
            <option value="specific_products">Produits spécifiques</option>
          </select>
        </div>

        {appliesTo === "specific_products" && (
          <div>
            <label className="block text-sm font-medium text-text-body mb-2">
              Produits éligibles
            </label>
            {products.length === 0 ? (
              <p className="text-xs text-gris-chaud">Chargement des produits…</p>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-marron-profond/10 rounded-xl p-3 space-y-2">
                {products.map((product) => (
                  <label
                    key={product.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      className="accent-orange"
                    />
                    <span className="text-text-body">{product.name}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.productIds && (
              <p className="text-red-500 text-xs mt-1">{errors.productIds}</p>
            )}
          </div>
        )}
      </div>

      {/* Usage limits */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Nombre d&apos;utilisations max
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            className={inputClass()}
            placeholder="Illimité"
          />
          <p className="text-xs text-gris-chaud mt-1">
            Vide = utilisations illimitées.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Limite par client
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={usageLimitPerCustomer}
            onChange={(e) => setUsageLimitPerCustomer(e.target.value)}
            className={inputClass()}
            placeholder="Illimité"
          />
          <p className="text-xs text-gris-chaud mt-1">
            Un m&ecirc;me client ne pourra pas utiliser ce code plus de X fois. Bas&eacute; sur l&apos;email.
          </p>
        </div>
      </div>

      {/* Validity dates */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Valide du
            </label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className={inputClass()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-body mb-1">
              Valide jusqu&apos;au
            </label>
            <input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      {/* Active toggle */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isActive ? "bg-orange" : "bg-gray-300"
            }`}
            onClick={() => setIsActive(!isActive)}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isActive ? "translate-x-5" : ""
              }`}
            />
          </div>
          <span className="text-sm font-medium text-text-body">
            {isActive ? "Actif" : "Inactif"}
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {isEdit && (
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Confirmer la suppression ?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Oui, supprimer"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (hasRedemptions) {
                    toast.error(
                      "Ce code a déjà été utilisé, il ne peut plus être supprimé. Désactive-le plutôt."
                    );
                  } else {
                    setConfirmDelete(true);
                  }
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-semibold"
              >
                <Trash2 size={16} />
                Supprimer
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 bg-orange text-blanc px-8 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-60 disabled:cursor-not-allowed ml-auto"
        >
          {saving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement…
            </>
          ) : (
            <>
              <Save size={18} />
              {isEdit ? "Mettre à jour" : "Créer le code promo"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
