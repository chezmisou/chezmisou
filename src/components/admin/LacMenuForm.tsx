"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload, X, ChevronUp, ChevronDown } from "lucide-react";

interface DishData {
  name: string;
  description: string;
  photoUrl: string;
  price: number;
  maxQuantity: number | null;
}

interface LacMenuData {
  id?: string;
  serviceDate: string;
  orderDeadline: string;
  deliveryZoneText: string;
  isPublished: boolean;
  dishes: DishData[];
  hasOrders?: boolean;
}

interface Props {
  initialData?: LacMenuData;
}

function showToast(message: string, type: "success" | "error" = "error") {
  const el = document.createElement("div");
  el.className = `fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-opacity ${
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
  }`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function computeDefaultDeadline(serviceDateStr: string): string {
  if (!serviceDateStr) return "";
  const d = new Date(serviceDateStr + "T18:00:00");
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}T18:00`;
}

export default function LacMenuForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceDateError, setServiceDateError] = useState("");

  const [form, setForm] = useState<LacMenuData>({
    serviceDate: initialData?.serviceDate || "",
    orderDeadline: initialData?.orderDeadline || "",
    deliveryZoneText: initialData?.deliveryZoneText || "",
    isPublished: initialData?.isPublished || false,
    dishes: initialData?.dishes?.length
      ? initialData.dishes
      : [{ name: "", description: "", photoUrl: "", price: 0, maxQuantity: null }],
  });

  const isEdit = !!initialData?.id;
  const hasOrders = initialData?.hasOrders || false;

  const updateField = <K extends keyof LacMenuData>(key: K, value: LacMenuData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleServiceDateChange = (value: string) => {
    if (value) {
      const day = new Date(value).getUTCDay();
      if (day !== 0) {
        setServiceDateError("La date de service doit tomber un dimanche.");
      } else {
        setServiceDateError("");
      }
    } else {
      setServiceDateError("");
    }

    setForm((prev) => {
      const updated = { ...prev, serviceDate: value };
      if (value && !prev.orderDeadline) {
        updated.orderDeadline = computeDefaultDeadline(value);
      }
      return updated;
    });
  };

  const addDish = () => {
    setForm((prev) => ({
      ...prev,
      dishes: [
        ...prev.dishes,
        { name: "", description: "", photoUrl: "", price: 0, maxQuantity: null },
      ],
    }));
  };

  const updateDish = (index: number, field: keyof DishData, value: string | number | null) => {
    setForm((prev) => ({
      ...prev,
      dishes: prev.dishes.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  };

  const removeDish = (index: number) => {
    if (form.dishes.length <= 1) {
      showToast("Au moins un plat est requis");
      return;
    }
    setForm((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((_, i) => i !== index),
    }));
  };

  const moveDish = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= form.dishes.length) return;
    setForm((prev) => {
      const dishes = [...prev.dishes];
      [dishes[index], dishes[newIndex]] = [dishes[newIndex], dishes[index]];
      return { ...prev, dishes };
    });
  };

  const handleImageUpload = async (index: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/lac/upload-dish-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        showToast("Erreur lors de l'upload de l'image");
        return;
      }

      const { url } = await res.json();
      updateDish(index, "photoUrl", url);
    } catch {
      showToast("Erreur lors de l'upload");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.serviceDate) {
      showToast("La date de service est requise");
      return;
    }

    const day = new Date(form.serviceDate).getUTCDay();
    if (day !== 0) {
      showToast("La date de service doit tomber un dimanche");
      return;
    }

    if (!form.orderDeadline) {
      showToast("La deadline de commande est requise");
      return;
    }

    const serviceDateTime = new Date(form.serviceDate + "T23:59:59");
    const deadlineDateTime = new Date(form.orderDeadline);
    if (deadlineDateTime >= serviceDateTime) {
      showToast("La deadline doit être avant la date de service");
      return;
    }

    if (form.dishes.length === 0) {
      showToast("Au moins un plat est requis");
      return;
    }

    if (form.dishes.some((d) => !d.name.trim())) {
      showToast("Chaque plat doit avoir un nom");
      return;
    }

    if (form.dishes.some((d) => !d.price || d.price <= 0)) {
      showToast("Chaque plat doit avoir un prix valide");
      return;
    }

    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/lac/${initialData!.id}` : "/api/admin/lac";
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

      showToast("Menu enregistré", "success");
      router.push("/admin/lac");
      router.refresh();
    } catch {
      showToast("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/lac/${initialData!.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erreur lors de la suppression");
        return;
      }

      showToast("Menu supprimé", "success");
      router.push("/admin/lac");
      router.refresh();
    } catch {
      showToast("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      {/* Informations du menu */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4">
        <h2 className="font-serif text-lg font-bold text-marron-profond">
          Informations du menu
        </h2>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Date du dimanche de service *
          </label>
          <input
            type="date"
            value={form.serviceDate}
            onChange={(e) => handleServiceDateChange(e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            required
          />
          {serviceDateError && (
            <p className="text-red-500 text-sm mt-1">{serviceDateError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Deadline de commande *
          </label>
          <input
            type="datetime-local"
            value={form.orderDeadline}
            onChange={(e) => updateField("orderDeadline", e.target.value)}
            className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-marron-profond mb-1">
            Zone de livraison
          </label>
          <textarea
            value={form.deliveryZoneText}
            onChange={(e) => updateField("deliveryZoneText", e.target.value)}
            rows={2}
            placeholder="ex : Paris 18e, 9e, 10e et communes limitrophes"
            className="w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange resize-none"
          />
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => updateField("isPublished", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gris-chaud/30 rounded-full peer-checked:bg-orange transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-blanc rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-medium text-marron-profond">
              Publier le menu
            </span>
          </label>
          <p className="text-xs text-gris-chaud mt-1 ml-14">
            Un menu en brouillon n&apos;est pas visible par les clients. Publie-le quand il est prêt.
          </p>
        </div>
      </div>

      {/* Plats du menu */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-marron-profond">
            Plats du menu
          </h2>
          <button
            type="button"
            onClick={addDish}
            className="inline-flex items-center gap-1 text-orange text-sm font-medium hover:text-orange-vif"
          >
            <Plus size={16} />
            Ajouter un plat
          </button>
        </div>

        <div className="space-y-4">
          {form.dishes.map((dish, index) => (
            <div
              key={index}
              className="p-4 bg-blanc-creme rounded-xl space-y-3 border border-marron-doux/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gris-chaud uppercase tracking-widest">
                  Plat {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveDish(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-gris-chaud hover:text-marron-profond disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Monter"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDish(index, "down")}
                    disabled={index === form.dishes.length - 1}
                    className="p-1 text-gris-chaud hover:text-marron-profond disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Descendre"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeDish(index)}
                    className="p-1 text-red-400 hover:text-red-600 ml-2"
                    title="Supprimer ce plat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gris-chaud mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={dish.name}
                    onChange={(e) => updateDish(index, "name", e.target.value)}
                    placeholder="ex : Griot traditionnel avec pikliz et bananes pésées"
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-gris-chaud mb-1">
                    Description
                  </label>
                  <textarea
                    value={dish.description}
                    onChange={(e) => updateDish(index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={dish.price || ""}
                    onChange={(e) =>
                      updateDish(index, "price", parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Quantité max
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dish.maxQuantity ?? ""}
                    onChange={(e) =>
                      updateDish(
                        index,
                        "maxQuantity",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="Illimité"
                    className="w-full px-3 py-2 rounded-lg border border-marron-doux/20 bg-blanc text-marron-profond text-sm focus:border-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs text-gris-chaud mb-1">Photo</label>
                {dish.photoUrl ? (
                  <div className="relative inline-block group">
                    <Image
                      src={dish.photoUrl}
                      alt={dish.name || "Photo du plat"}
                      width={120}
                      height={120}
                      className="rounded-xl object-cover w-[120px] h-[120px] border border-marron-doux/20"
                    />
                    <button
                      type="button"
                      onClick={() => updateDish(index, "photoUrl", "")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefs.current[index]?.click()}
                    className="w-[120px] h-[120px] rounded-xl border-2 border-dashed border-marron-doux/30 flex flex-col items-center justify-center text-gris-chaud hover:border-orange hover:text-orange transition-colors"
                  >
                    <Upload size={24} />
                    <span className="text-xs mt-1">Ajouter</span>
                  </button>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[index] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleImageUpload(index, e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
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
              ? "Mettre à jour le menu"
              : "Créer le menu"}
        </button>

        {isEdit && (
          <button
            type="button"
            onClick={() => {
              if (hasOrders) {
                showToast("Ce menu a déjà des commandes payées, il ne peut pas être supprimé.");
                return;
              }
              setShowDeleteConfirm(true);
            }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Supprimer ce menu
          </button>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-blanc rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-serif text-lg font-bold text-marron-profond mb-2">
              Supprimer ce menu ?
            </h3>
            <p className="text-text-body text-sm mb-4">
              Cette action est irréversible. Le menu et tous ses plats seront supprimés.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-marron-doux/30 text-text-body hover:bg-blanc-creme transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
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
