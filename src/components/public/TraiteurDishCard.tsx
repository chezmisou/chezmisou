"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useTraiteurSelection } from "@/lib/traiteur/TraiteurSelectionContext";

interface Format {
  id: string;
  minPeople: number;
  maxPeople: number;
  indicativePricePerPerson: number;
}

interface Props {
  dish: {
    id: string;
    name: string;
    description: string | null;
    photoUrl: string | null;
    category: string | null;
    formats: Format[];
  };
}

export default function TraiteurDishCard({ dish }: Props) {
  const { selectedDishIds, toggleDish } = useTraiteurSelection();
  const [expanded, setExpanded] = useState(false);

  const isSelected = selectedDishIds.has(dish.id);
  const prices = dish.formats.map((f) => f.indicativePricePerPerson);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div
      className={`bg-blanc rounded-2xl overflow-hidden shadow-sm border-2 transition-all cursor-pointer ${
        isSelected
          ? "border-orange bg-orange/5 shadow-md"
          : "border-marron-doux/20 hover:border-orange/40"
      }`}
      onClick={() => toggleDish(dish.id)}
    >
      {/* Image */}
      {dish.photoUrl && (
        <div className="relative h-48 w-full">
          <Image
            src={dish.photoUrl}
            alt={dish.name}
            fill
            className="object-cover"
          />
          {isSelected && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-orange rounded-full flex items-center justify-center shadow-lg">
              <Check size={18} className="text-blanc" />
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Name */}
        <h3 className="font-serif text-xl font-bold text-marron-profond mb-1">
          {dish.name}
        </h3>

        {/* Category */}
        {dish.category && (
          <p className="text-xs uppercase tracking-widest text-orange font-medium mb-2">
            {dish.category}
          </p>
        )}

        {/* Description */}
        {dish.description && (
          <p className="text-sm text-text-body leading-relaxed mb-3">
            {dish.description}
          </p>
        )}

        {/* Price range */}
        <p className="text-sm font-semibold text-marron-profond mb-2">
          {minPrice === maxPrice
            ? `${minPrice.toFixed(0)} € / personne`
            : `${minPrice.toFixed(0)} à ${maxPrice.toFixed(0)} € / personne selon le format`}
        </p>

        {/* Expandable formats */}
        {dish.formats.length > 0 && (
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex items-center gap-1 text-xs text-orange hover:text-orange-vif transition-colors"
            >
              {expanded ? "Masquer les détails" : "Voir les tarifs détaillés"}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {expanded && (
              <div className="mt-2 space-y-1">
                {dish.formats.map((f) => (
                  <p key={f.id} className="text-xs text-text-body">
                    {f.minPeople}–{f.maxPeople} pers : {Number(f.indicativePricePerPerson).toFixed(0)} €/pers
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Checkbox indicator */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-orange border-orange"
                : "border-marron-doux/40"
            }`}
          >
            {isSelected && <Check size={14} className="text-blanc" />}
          </div>
          <span
            className={`text-sm font-medium ${
              isSelected ? "text-orange" : "text-gris-chaud"
            }`}
          >
            {isSelected ? "Sélectionné" : "Ajouter à ma demande"}
          </span>
        </div>
      </div>
    </div>
  );
}
