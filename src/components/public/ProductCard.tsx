import Image from "next/image";
import Link from "next/link";
import type { Decimal } from "@prisma/client/runtime/library";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    isFeatured: boolean;
    images: { url: string; alt: string | null }[];
    variants: { price: Decimal }[];
  };
};

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export default function ProductCard({ product }: ProductCardProps) {
  const image = product.images[0];
  const prices = product.variants.map((v) => Number(v.price));
  const minPrice = Math.min(...prices);
  const hasMultipleVariants = product.variants.length > 1;

  return (
    <Link
      href={`/epicerie/${product.slug}`}
      className="group block bg-blanc rounded-2xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden bg-blanc-creme">
        {image && (
          <Image
            src={image.url}
            alt={image.alt || product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {product.isFeatured && (
          <span className="absolute top-3 left-3 bg-orange text-blanc text-xs font-semibold px-3 py-1 rounded-full">
            Coup de c&oelig;ur
          </span>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-marron-profond mb-2">
          {product.name}
        </h3>
        <p className="text-text-body font-sans text-sm">
          {hasMultipleVariants ? "À partir de " : ""}
          {priceFormatter.format(minPrice)}
        </p>
      </div>
    </Link>
  );
}
