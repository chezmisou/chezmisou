import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const { name, slug, description, basePrice, isFeatured, isActive, variants, images } = body;

    if (!name || !slug || !description) {
      return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name,
          slug,
          description,
          basePrice: parseFloat(basePrice) || 0,
          isFeatured: !!isFeatured,
          isActive: isActive !== false,
        },
      });

      if (variants?.length) {
        await tx.productVariant.createMany({
          data: variants.map((v: { name: string; price: number; stock: number; sku?: string }, i: number) => ({
            productId: p.id,
            name: v.name,
            price: parseFloat(String(v.price)) || 0,
            stock: parseInt(String(v.stock)) || 0,
            sku: v.sku || null,
            position: i,
          })),
        });
      }

      if (images?.length) {
        await tx.productImage.createMany({
          data: images.map((img: { url: string; position: number }) => ({
            productId: p.id,
            url: img.url,
            position: img.position || 0,
          })),
        });
      }

      return p;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("Error creating product:", err);
    return NextResponse.json({ error: "Erreur lors de la création du produit" }, { status: 500 });
  }
}
