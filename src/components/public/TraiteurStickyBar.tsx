"use client";

import { useTraiteurSelection } from "@/lib/traiteur/TraiteurSelectionContext";

export default function TraiteurStickyBar() {
  const { selectedDishIds } = useTraiteurSelection();
  const count = selectedDishIds.size;

  if (count === 0) return null;

  const scrollToForm = () => {
    const el = document.getElementById("devis-form");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-marron-profond text-blanc px-4 py-3 shadow-lg lg:hidden">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <span className="text-sm font-medium">
          {count} plat{count > 1 ? "s" : ""} sélectionné{count > 1 ? "s" : ""}
        </span>
        <button
          onClick={scrollToForm}
          className="bg-orange text-blanc px-5 py-2 rounded-xl font-semibold text-sm hover:bg-orange-vif transition-colors"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
