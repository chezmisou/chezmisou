import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil } from "lucide-react";
import PromoDeleteButton from "@/components/admin/PromoDeleteButton";

export const dynamic = "force-dynamic";

function formatCurrency(value: unknown): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatus(promo: {
  isActive: boolean;
  validUntil: Date | null;
  usageLimit: number | null;
  usedCount: number;
}): { label: string; color: string } {
  if (!promo.isActive) return { label: "Inactif", color: "bg-gray-100 text-gray-600" };
  if (promo.validUntil && new Date() > promo.validUntil)
    return { label: "Expiré", color: "bg-red-100 text-red-700" };
  if (promo.usageLimit && promo.usedCount >= promo.usageLimit)
    return { label: "Épuisé", color: "bg-amber-100 text-amber-700" };
  return { label: "Actif", color: "bg-green-100 text-green-700" };
}

function appliesLabel(appliesTo: string): string {
  switch (appliesTo) {
    case "all":
      return "Tout";
    case "epicerie":
      return "Épicerie";
    case "lac":
      return "LAC";
    case "specific_products":
      return "Produits spécifiques";
    default:
      return appliesTo;
  }
}

export default async function AdminPromosPage() {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-marron-profond">
            Codes promo
          </h1>
          <p className="text-text-body mt-1">
            {promos.length} code{promos.length !== 1 ? "s" : ""} promo
          </p>
        </div>
        <Link
          href="/admin/promos/nouveau"
          className="flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm"
        >
          <Plus size={18} />
          Nouveau code promo
        </Link>
      </div>

      {promos.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud mb-4">
            Aucun code promo pour le moment.
          </p>
          <Link
            href="/admin/promos/nouveau"
            className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm"
          >
            <Plus size={18} />
            Créer le premier code
          </Link>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Valeur
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    S&apos;applique &agrave;
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Utilisations
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Validité
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {promos.map((promo) => {
                  const status = getStatus(promo);
                  return (
                    <tr
                      key={promo.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-marron-profond">
                        {promo.code}
                      </td>
                      <td className="py-3 px-4 text-text-body max-w-[200px] truncate">
                        {promo.description || "—"}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {promo.discountType === "percentage" ? "Pourcentage" : "Montant fixe"}
                      </td>
                      <td className="py-3 px-4 font-semibold text-marron-profond">
                        {promo.discountType === "percentage"
                          ? `${Number(promo.discountValue)}%`
                          : formatCurrency(promo.discountValue)}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {appliesLabel(promo.appliesTo)}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {promo.usedCount} / {promo.usageLimit ?? "∞"}
                      </td>
                      <td className="py-3 px-4 text-text-body text-xs">
                        {formatDate(promo.validFrom)} → {formatDate(promo.validUntil)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/promos/${promo.id}/edit`}
                            className="p-2 rounded-lg text-gris-chaud hover:text-orange hover:bg-orange/10 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </Link>
                          <PromoDeleteButton
                            promoId={promo.id}
                            promoCode={promo.code}
                            hasRedemptions={promo._count.redemptions > 0}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
