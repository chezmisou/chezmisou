import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  const initialData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    basePrice: Number(product.basePrice),
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      stock: v.stock,
      sku: v.sku || "",
    })),
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      position: img.position,
    })),
  };

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
          Modifier : {product.name}
        </h1>
      </div>
      <ProductForm initialData={initialData} />
    </div>
  );
}
