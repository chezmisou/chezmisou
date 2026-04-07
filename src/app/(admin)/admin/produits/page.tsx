import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Plus, ExternalLink, Pencil, Heart } from "lucide-react";

function formatCurrency(value: unknown): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

export default async function AdminProduitsPage() {
  const products = await prisma.product.findMany({
    include: {
      variants: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Produits
        </h1>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
        >
          <Plus size={20} />
          Nouveau produit
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud text-lg mb-4">
            Aucun produit pour le moment
          </p>
          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
          >
            <Plus size={20} />
            Créer votre premier produit
          </Link>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20 bg-blanc-creme/50">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Image
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Nom
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden md:table-cell">
                    Slug
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Prix
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden sm:table-cell">
                    Variantes
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden sm:table-cell">
                    Stock
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest hidden md:table-cell">
                    Favori
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const firstImage = product.images[0];
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  );

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        {firstImage ? (
                          <Image
                            src={firstImage.url}
                            alt={product.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover w-[60px] h-[60px]"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] rounded-lg bg-blanc-creme flex items-center justify-center text-2xl">
                            🫙
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-marron-profond">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 text-gris-chaud font-mono text-xs hidden md:table-cell">
                        {product.slug}
                      </td>
                      <td className="py-3 px-4 text-right text-marron-profond font-semibold">
                        {formatCurrency(product.basePrice)}
                      </td>
                      <td className="py-3 px-4 text-center text-text-body hidden sm:table-cell">
                        {product.variants.length}
                      </td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span
                          className={
                            totalStock < 5 && product.variants.length > 0
                              ? "text-red-600 font-semibold"
                              : "text-text-body"
                          }
                        >
                          {product.variants.length > 0 ? totalStock : "—"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gris-chaud/20 text-gris-chaud"
                          }`}
                        >
                          {product.isActive ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        {product.isFeatured && (
                          <Heart
                            size={16}
                            className="inline text-red-500 fill-red-500"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/produits/${product.id}/edit`}
                            className="inline-flex items-center gap-1 text-orange hover:text-orange-vif text-xs font-medium"
                          >
                            <Pencil size={14} />
                            Modifier
                          </Link>
                          <a
                            href={`/epicerie/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-xs"
                          >
                            <ExternalLink size={14} />
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
