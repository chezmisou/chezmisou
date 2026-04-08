import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import LacMenuForm from "@/components/admin/LacMenuForm";

export default function NouveauLacMenuPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/lac"
          className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2"
        >
          <ChevronLeft size={16} />
          Retour aux menus
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Nouveau menu
        </h1>
      </div>
      <LacMenuForm />
    </div>
  );
}
