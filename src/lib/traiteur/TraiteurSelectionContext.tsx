"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface TraiteurSelectionContextType {
  selectedDishIds: Set<string>;
  toggleDish: (id: string) => void;
  clear: () => void;
}

const TraiteurSelectionContext = createContext<TraiteurSelectionContextType | null>(null);

export function TraiteurSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedDishIds, setSelectedDishIds] = useState<Set<string>>(new Set());

  const toggleDish = useCallback((id: string) => {
    setSelectedDishIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedDishIds(new Set());
  }, []);

  return (
    <TraiteurSelectionContext.Provider value={{ selectedDishIds, toggleDish, clear }}>
      {children}
    </TraiteurSelectionContext.Provider>
  );
}

export function useTraiteurSelection() {
  const ctx = useContext(TraiteurSelectionContext);
  if (!ctx) {
    throw new Error("useTraiteurSelection must be used within TraiteurSelectionProvider");
  }
  return ctx;
}
