"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 text-gris-chaud hover:text-marron-profond text-sm font-medium print:hidden"
    >
      <Printer size={18} />
      Imprimer cette page
    </button>
  );
}
