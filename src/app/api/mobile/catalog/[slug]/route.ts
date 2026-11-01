import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { num } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Épicerie : fiche produit pour l'app mobile. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const p = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { orderBy: { position: "asc" } },
    },
  });
  if (!p) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });

  return NextResponse.json({
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: num(v.price),
      stock: v.stock,
    })),
  });
}
