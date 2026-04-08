import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, Pencil, ExternalLink } from "lucide-react";

function formatCurrency(value: unknown): string {
  const num = Number(value) || 0;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(num);
}

export default async function AdminTraiteurPage() {
  const dishes = await prisma.traiteurDish.findMany({
    include: { formats: { orderBy: { minPeople: "asc" } } },
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-marron-profond">
            Plats traiteur
          </h1>
          <p className="text-text-body mt-1">
            {dishes.length} plat{dishes.length !== 1 ? "s" : ""} au catalogue
          </p>
        </div>
        <Link
          href="/admin/traiteur/nouveau"
          className="flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm"
        >
          <Plus size={18} />
          Nouveau plat traiteur
        </Link>
      </div>

      {dishes.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud mb-4">
            Aucun plat traiteur pour le moment.
          </p>
          <Link
            href="/admin/traiteur/nouveau"
            className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm"
          >
            <Plus size={18} />
            Créer le premier plat
          </Link>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Photo
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Nom
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Catégorie
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Formats
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Prix/pers
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish) => {
                  const prices = dish.formats.map((f) =>
                    Number(f.indicativePricePerPerson)
                  );
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  return (
                    <tr
                      key={dish.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {dish.photoUrl ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                            <Image
                              src={dish.photoUrl}
                              alt={dish.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-blanc-creme flex items-center justify-center text-gris-chaud text-xs">
                            —
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-marron-profond">
                        {dish.name}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {dish.category || "—"}
                      </td>
                      <td className="py-3 px-4 text-center text-text-body">
                        {dish.formats.length}
                      </td>
                      <td className="py-3 px-4 text-right text-marron-profond font-medium">
                        {prices.length > 0
                          ? minPrice === maxPrice
                            ? formatCurrency(minPrice)
                            : `${formatCurrency(minPrice)} — ${formatCurrency(maxPrice)}`
                          : "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            dish.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gris-chaud/20 text-gris-chaud"
                          }`}
                        >
                          {dish.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/traiteur/${dish.id}/edit`}
                            className="p-2 text-gris-chaud hover:text-orange transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={16} />
                          </Link>
                          <a
                            href="/traiteur"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gris-chaud hover:text-orange transition-colors"
                            title="Voir sur le site"
                          >
                            <ExternalLink size={16} />
                          </a>
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
