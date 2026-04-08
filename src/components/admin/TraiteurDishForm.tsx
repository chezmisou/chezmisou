"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Format {
  id?: string;
  minPeople: number;
  maxPeople: number;
  indicativePricePerPerson: number;
}

interface DishData {
  id?: string;
  name: string;
  description: string;
  category: string;
  baseInfo: string;
  photoUrl: string;
  isActive: boolean;
  formats: Format[];
}

interface Props {
  initialData?: DishData;
}

export default function TraiteurDishForm({ initialData }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<DishData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    baseInfo: initialData?.baseInfo || "",
    photoUrl: initialData?.photoUrl || "",
    isActive: initialData?.isActive ?? true,
    formats: initialData?.formats?.length
      ? initialData.formats
      : [{ minPeople: 5, maxPeople: 15, indicativePricePerPerson: 15 }],
  });

  const isEditing = !!initialData?.id;

  const updateField = (field: keyof DishData, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFormat = () => {
    setForm((prev) => ({
      ...prev,
      formats: [
        ...prev.formats,
        { minPeople: 10, maxPeople: 20, indicativePricePerPerson: 12 },
      ],
    }));
  };

  const removeFormat = (index: number) => {
    if (form.formats.length <= 1) {
      toast.error("Au moins un format est requis");
      return;
    }
    setForm((prev) => ({
      ...prev,
      formats: prev.formats.filter((_, i) => i !== index),
    }));
  };

  const updateFormat = (index: number, field: keyof Format, value: number) => {
    setForm((prev) => ({
      ...prev,
      formats: prev.formats.map((f, i) =>
        i === index ? { ...f, [field]: value } : f
      ),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/traiteur/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de l'upload");
        return;
      }

      const data = await res.json();
      updateField("photoUrl", data.url);
      toast.success("Photo téléchargée");
    } catch {
      toast.error("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }

    if (form.formats.length === 0) {
      toast.error("Au moins un format est requis");
      return;
    }

    for (const f of form.formats) {
      if (f.minPeople > f.maxPeople) {
        toast.error("Le nombre min de personnes doit être inférieur ou égal au max");
        return;
      }
      if (f.indicativePricePerPerson <= 0) {
        toast.error("Le prix indicatif doit être supérieur à 0");
        return;
      }
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/admin/traiteur/${initialData!.id}`
        : "/api/admin/traiteur";

      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          category: form.category || null,
          baseInfo: form.baseInfo || null,
          photoUrl: form.photoUrl || null,
          isActive: form.isActive,
          formats: form.formats.map((f) => ({
            minPeople: f.minPeople,
            maxPeople: f.maxPeople,
            indicativePricePerPerson: f.indicativePricePerPerson,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la sauvegarde");
        return;
      }

      toast.success(isEditing ? "Plat mis à jour" : "Plat créé");
      router.push("/admin/traiteur");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/traiteur/${initialData!.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Erreur lors de la suppression");
        return;
      }

      toast.success("Plat supprimé");
      router.push("/admin/traiteur");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange";

  return (
    <div className="max-w-3xl space-y-8">
      {/* Nom */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Nom *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="Griot traditionnel aux épices haïtiennes"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={4}
          className={inputClass}
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Catégorie
        </label>
        <input
          type="text"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="Plat principal, Accompagnement, Dessert…"
          className={inputClass}
        />
      </div>

      {/* Info de base */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Info de base
        </label>
        <textarea
          value={form.baseInfo}
          onChange={(e) => updateField("baseInfo", e.target.value)}
          rows={2}
          placeholder="Viande de porc marinée puis frite, accompagnée de pikliz et bananes pésées"
          className={inputClass}
        />
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-semibold text-marron-profond mb-1.5">
          Photo
        </label>
        {form.photoUrl ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-marron-doux/20">
            <Image
              src={form.photoUrl}
              alt="Photo du plat"
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => updateField("photoUrl", "")}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-marron-doux/40 text-gris-chaud hover:border-orange hover:text-orange transition-colors"
          >
            <Upload size={18} />
            {uploading ? "Téléchargement…" : "Choisir une photo"}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Toggle actif */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => updateField("isActive", !form.isActive)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            form.isActive ? "bg-orange" : "bg-gris-chaud/30"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
              form.isActive ? "translate-x-5" : ""
            }`}
          />
        </button>
        <span className="text-sm font-medium text-marron-profond">
          {form.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* Formats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif font-bold text-marron-profond">
            Formats et tarifs
          </h3>
          <button
            type="button"
            onClick={addFormat}
            className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-vif transition-colors"
          >
            <Plus size={16} />
            Ajouter un format
          </button>
        </div>

        <div className="space-y-4">
          {form.formats.map((format, index) => (
            <div
              key={index}
              className="bg-blanc rounded-xl border border-marron-doux/20 p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm font-medium text-gris-chaud">
                  Format {index + 1}
                </span>
                {form.formats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFormat(index)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Min personnes *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={format.minPeople}
                    onChange={(e) =>
                      updateFormat(index, "minPeople", parseInt(e.target.value) || 1)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Max personnes *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={format.maxPeople}
                    onChange={(e) =>
                      updateFormat(index, "maxPeople", parseInt(e.target.value) || 1)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gris-chaud mb-1">
                    Prix/pers (€) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={format.indicativePricePerPerson}
                    onChange={(e) =>
                      updateFormat(
                        index,
                        "indicativePricePerPerson",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-4 border-t border-marron-doux/20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange text-blanc px-6 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
        >
          {saving
            ? "Sauvegarde…"
            : isEditing
              ? "Mettre à jour"
              : "Créer le plat"}
        </button>
        <button
          onClick={() => router.push("/admin/traiteur")}
          className="px-6 py-2.5 rounded-xl font-semibold text-gris-chaud hover:text-marron-profond transition-colors"
        >
          Annuler
        </button>

        {isEditing && (
          <>
            <div className="flex-1" />
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Confirmer la suppression ?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Suppression…" : "Oui, supprimer"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-gris-chaud hover:text-marron-profond"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Supprimer ce plat
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
