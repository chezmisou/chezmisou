"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, GripVertical, Upload, X } from "lucide-react";

interface Variant {
  id?: string;
  name: string;
  price: number;
  stock: number;
  sku: string;
}

interface ProductImage {
  id?: string;
  url: string;
  position: number;
}

interface ProductData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  isFeatured: boolean;
  isActive: boolean;
  variants: Variant[];
  images: ProductImage[];
}

interface Props {
  initialData?: ProductData;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function showToast(message: string, type: "success" | "error" = "error") {
  const el = document.createElement("div");
  el.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-opacity ${
    type === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white"
  }`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

export default function ProductForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);

  const [form, setForm] = useState<ProductData>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    basePrice: initialData?.basePrice || 0,
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    variants:
      initialData?.variants?.length
        ? initialData.variants.map((v) => ({ ...v, sku: v.sku || "" }))
        : [{ name: "", price: 0, stock: 0, sku: "" }],
    images: initialData?.images || [],
  });

  const isEdit = !!initialData?.id;

  const updateField = <K extends keyof ProductData>(
    key: K,
    value: ProductData[K]
  ) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: value };
      if (key === "name" && !slugManual) {
        updated.slug = slugify(value as string);
      }
      return updated;
    });
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { name: "", price: prev.basePrice, stock: 0, sku: "" },
      ],
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  const removeVariant = (index: number) => {
    if (form.variants.length <= 1) {
      showToast("Au moins une variante est requise");
      return;
    }
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/produits/upload-image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          showToast("Erreur lors de l'upload de l'image");
          continue;
        }

        const { url } = await res.json();
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, { url, position: prev.images.length }],
        }));
      } catch {
        showToast("Erreur lors de l'upload");
      }
    }
  };

  const removeImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, position: i })),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      showToast("Le nom est requis");
      return;
    }
    if (!form.slug.trim()) {
      showToast("Le slug est requis");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      showToast(
        "Le slug doit être en kebab-case (lettres minuscules, chiffres, tirets)"
      );
      return;
    }
    if (!form.description.trim()) {
      showToast("La description est requise");
      return;
    }
    if (form.variants.length === 0) {
      showToast("Au moins une variante est requise");
      return;
    }
    if (form.variants.some((v) => !v.name.trim())) {
      showToast("Chaque variante doit avoir un nom");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit
        ? `/api/admin/produits/${initialData!.id}`
        : "/api/admin/produits";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erreur lors de l'enregistrement");
        return;
      }

      showToast(isEdit ? "Produit mis à jour" : "Produit créé", "success");
      router.push("/admin/produits");
      router.refresh();
    } catch {
      showToast("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmName !== form.name) {
      showToast("Le nom ne correspond pas");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/produits/${initialData!.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        showToast("Erreur lors de la suppression");
        return;
      }

      showToast("Produit supprimé", "success");
      router.push("/admin/produits");
      router.refresh();
    } catch {
      showToast("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Basic info */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4">
        <h2 className="font-serif text-lg font-bold text-marron-profond">
          Informations générales
        </h2>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Nom *
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Slug *
            <button
              type="button"
              onClick={() => {
                setSlugManual(!slugManual);
                if (slugManual) {
                  updateField("slug", slugify(form.name));
                }
              }}
              className="ml-2 text-xs text-orange hover:underline"
            >
              {slugManual ? "Générer automatiquement" : "Modifier manuellement"}
            </button>
          </label>
          <input
            type="text"
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              updateField(
                "slug",
                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")
              );
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond font-mono text-sm focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Description *
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Prix de base *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.basePrice}
            onChange={(e) =>
              updateField("basePrice", parseFloat(e.target.value) || 0)
            }
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            required
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField("isFeatured", e.target.checked)}
              className="w-4 h-4 rounded border-marron-doux/30 text-orange focus:ring-orange accent-orange"
            />
            <span className="text-sm text-marron-profond">Coup de cœur</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateField("isActive", e.target.checked)}
              className="w-4 h-4 rounded border-marron-doux/30 text-orange focus:ring-orange accent-orange"
            />
            <span className="text-sm text-marron-profond">Actif</span>
          </label>
        </div>
      </div>

      {/* Photos */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4">
        <h2 className="font-serif text-lg font-bold text-marron-profond">
          Photos
        </h2>

        <div className="flex flex-wrap gap-3">
          {form.images.map((img, index) => (
            <div key={index} className="relative group">
              <Image
                src={img.url}
                alt={`Photo ${index + 1}`}
                width={120}
                height={120}
                className="rounded-xl object-cover w-[120px] h-[120px] border border-marron-doux/20"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                {index + 1}
              </span>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-marron-doux/30 flex flex-col items-center justify-center text-gris-chaud hover:border-orange hover:text-orange transition-colors"
          >
            <Upload size={24} />
            <span className="text-xs mt-1">Ajouter</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              handleImageUpload(e.target.files);
              e.target.value = "";
            }
          }}
        />
      </div>

      {/* Variants */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-marron-profond">
            Variantes
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-orange text-sm font-medium hover:text-orange-vif"
          >
            <Plus size={16} />
            Ajouter une variante
          </button>
        </div>

        <div className="space-y-3">
          {form.variants.map((variant, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 bg-blanc-creme rounded-xl"
            >
              <div className="text-marron-doux/40 pt-2">
                <GripVertical size={16} />
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) =>
                      updateVariant(index, "name", e.target.value)
                    }
                    placeholder="ex : 250ml"
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Prix
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={variant.price}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(
                        index,
                        "stock",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder="Optionnel"
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="text-red-400 hover:text-red-600 pt-6"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={saving}
          className="bg-orange text-blanc px-8 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
        >
          {saving
            ? "Enregistrement…"
            : isEdit
              ? "Mettre à jour"
              : "Créer le produit"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Supprimer ce produit
          </button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-blanc rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-lg font-bold text-marron-profond mb-2">
              Supprimer ce produit ?
            </h3>
            <p className="text-text-body text-sm mb-4">
              Cette action est irréversible. Tapez{" "}
              <strong>{form.name}</strong> pour confirmer.
            </p>
            <input
              type="text"
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              placeholder="Nom du produit"
              className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond mb-4 focus:border-red-500 focus:outline-none"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmName("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-marron-doux/30 text-text-body hover:bg-blanc-creme transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirmName !== form.name || deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
