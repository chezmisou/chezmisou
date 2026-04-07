import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const { name, slug, description, basePrice, isFeatured, isActive, variants, images } = body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug } });
      if (slugTaken) {
        return NextResponse.json({ error: "Ce slug est déjà utilisé" }, { status: 400 });
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          name: name || existing.name,
          slug: slug || existing.slug,
          description: description ?? existing.description,
          basePrice: basePrice !== undefined ? parseFloat(basePrice) || 0 : undefined,
          isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
          isActive: isActive !== undefined ? !!isActive : undefined,
        },
      });

      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: { name: string; price: number; stock: number; sku?: string }, i: number) => ({
              productId: id,
              name: v.name,
              price: parseFloat(String(v.price)) || 0,
              stock: parseInt(String(v.stock)) || 0,
              sku: v.sku || null,
              position: i,
            })),
          });
        }
      }

      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: { url: string; position: number }) => ({
              productId: id,
              url: img.url,
              position: img.position || 0,
            })),
          });
        }
      }

      return p;
    });

    return NextResponse.json(product);
  } catch (err) {
    console.error("Error updating product:", err);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting product:", err);
    return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 });
  }
}
