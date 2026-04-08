import PromoCodeForm from "@/components/admin/PromoCodeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AdminNewPromoPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/promos"
        className="inline-flex items-center gap-1 text-sm text-text-body hover:text-orange transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à la liste
      </Link>

      <h1 className="font-serif text-3xl font-bold text-marron-profond">
        Nouveau code promo
      </h1>

      <PromoCodeForm />
    </div>
  );
}
