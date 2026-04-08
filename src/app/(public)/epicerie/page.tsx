import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/public/ProductCard";
import { getNumberSetting, SETTING_KEYS } from "@/lib/settings";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "L'épicerie fine",
  description:
    "Découvrez notre sélection de produits haïtiens authentiques : krémas, piments, pikliz, épices et bien plus. Livraison en France métropolitaine.",
};

export default async function EpiceriePage() {
  const [products, shippingCost, freeThreshold] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        variants: { orderBy: { position: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getNumberSetting(SETTING_KEYS.SHIPPING_COST_FRANCE.key, SETTING_KEYS.SHIPPING_COST_FRANCE.default),
    getNumberSetting(SETTING_KEYS.FREE_SHIPPING_THRESHOLD.key, SETTING_KEYS.FREE_SHIPPING_THRESHOLD.default),
  ]);

  const shippingLabel = shippingCost.toFixed(2).replace(".", ",");
  const thresholdLabel = freeThreshold % 1 === 0 ? String(freeThreshold) : freeThreshold.toFixed(2).replace(".", ",");

  return (
    <>
      {/* Hero */}
      <section className="flex items-center justify-center bg-blanc-creme min-h-[50vh] px-6 text-center">
        <div>
          <h1 className="font-serif text-5xl md:text-7xl text-marron-profond mb-4">
            L&rsquo;&eacute;picerie fine
          </h1>
          <p className="font-sans text-lg md:text-xl text-text-body max-w-xl mx-auto">
            Les saveurs d&rsquo;Ha&iuml;ti livr&eacute;es chez vous.
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
        <p className="font-sans text-sm md:text-base">
          Livraison en France m&eacute;tropolitaine &middot; {shippingLabel}&nbsp;&euro; &middot; Offerte d&egrave;s {thresholdLabel}&nbsp;&euro; d&rsquo;achat
        </p>
      </section>
    </>
  );
}
