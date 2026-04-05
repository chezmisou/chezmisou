import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });
  if (!product) return {};
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });

  if (!product) notFound();

  const image = product.images[0];

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Breadcrumb */}
      <nav className="mb-8 text-sm font-sans text-text-body">
        <Link href="/epicerie" className="hover:text-orange transition-colors">
          &Eacute;picerie
        </Link>
        <span className="mx-2">/</span>
        <span className="text-marron-profond">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Image */}
        <div className="relative aspect-square rounded-3xl shadow-2xl overflow-hidden bg-blanc-creme">
          {image && (
            <Image
              src={image.url}
              alt={image.alt || product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="font-serif text-4xl text-marron-profond">
            {product.name}
          </h1>
          <p className="font-sans text-text-body leading-relaxed">
            {product.description}
          </p>

          <ProductDetailClient
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: image?.url || "",
            }}
            variants={product.variants.map((v) => ({
              id: v.id,
              name: v.name,
              price: Number(v.price),
              stock: v.stock,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
