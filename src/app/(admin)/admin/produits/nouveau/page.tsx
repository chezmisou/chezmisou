import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NouveauProduitPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/produits"
          className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2"
        >
          <ChevronLeft size={16} />
          Retour aux produits
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Nouveau produit
        </h1>
      </div>
      <ProductForm />
    </div>
  );
}
