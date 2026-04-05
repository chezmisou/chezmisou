import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/public/ProductCard";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "L'épicerie fine — Chez Misou",
  description:
    "Les saveurs d'Haïti livrées chez vous. Krémas, pikliz, épices, café et plus encore.",
};

export default async function EpiceriePage() {
  const products = await prisma.catalogProduct.findMany({
    where: { isActive: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { orderBy: { position: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      {/* Hero */}
      <section className="flex items-center justify-center bg-blanc-creme min-h-[50vh] md:min-h-[50vh] px-6 text-center">
        <div>
          <h1 className="font-playfair text-5xl md:text-7xl text-marron-profond mb-4">
            L&apos;épicerie fine
          </h1>
          <p className="font-body text-lg md:text-xl text-text-body max-w-xl mx-auto">
            Les saveurs d&apos;Haïti livrées chez vous.
          </p>
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Shipping banner */}
      <section className="bg-marron-profond text-blanc-creme py-6 text-center">
        <p className="font-body text-sm md:text-base">
          Livraison en France métropolitaine · 6,90 € · Offerte dès 60 € d&apos;achat
        </p>
      </section>
    </>
  );
}
