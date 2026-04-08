import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TraiteurDishForm from "@/components/admin/TraiteurDishForm";

export default function NouveauTraiteurDishPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/traiteur"
          className="inline-flex items-center gap-1 text-sm text-gris-chaud hover:text-orange transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Retour aux plats traiteur
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Nouveau plat traiteur
        </h1>
      </div>

      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <TraiteurDishForm />
      </div>
    </div>
  );
}
