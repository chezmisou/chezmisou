import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      appliesTo,
      usageLimit,
      usageLimitPerCustomer,
      validFrom,
      validUntil,
      isActive,
      productIds,
    } = body;

    const existing = await prisma.promoCode.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Code promo introuvable" }, { status: 404 });
    }

    if (code) {
      const normalizedCode = code.toUpperCase().trim();
      if (normalizedCode.length < 3 || normalizedCode.length > 20 || !/^[A-Z0-9]+$/.test(normalizedCode)) {
        return NextResponse.json(
          { error: "Le code doit contenir entre 3 et 20 caractères alphanumériques" },
          { status: 400 }
        );
      }
      const duplicate = await prisma.promoCode.findFirst({
        where: { code: normalizedCode, NOT: { id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: "Ce code promo existe déjà" }, { status: 409 });
      }
    }

    // Update products relation if appliesTo changed to specific_products
    if (appliesTo === "specific_products" && productIds) {
      await prisma.promoCodeProduct.deleteMany({ where: { promoCodeId: id } });
      if (productIds.length > 0) {
        await prisma.promoCodeProduct.createMany({
          data: productIds.map((pid: string) => ({ promoCodeId: id, productId: pid })),
        });
      }
    } else if (appliesTo && appliesTo !== "specific_products") {
      await prisma.promoCodeProduct.deleteMany({ where: { promoCodeId: id } });
    }

    const promo = await prisma.promoCode.update({
      where: { id },
      data: {
        ...(code ? { code: code.toUpperCase().trim() } : {}),
        ...(description !== undefined ? { description: description || null } : {}),
        ...(discountType ? { discountType } : {}),
        ...(discountValue != null ? { discountValue: parseFloat(discountValue) } : {}),
        ...(minOrderAmount !== undefined
          ? { minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null }
          : {}),
        ...(appliesTo ? { appliesTo } : {}),
        ...(usageLimit !== undefined
          ? { usageLimit: usageLimit ? parseInt(usageLimit) : null }
          : {}),
        ...(usageLimitPerCustomer !== undefined
          ? { usageLimitPerCustomer: usageLimitPerCustomer ? parseInt(usageLimitPerCustomer) : null }
          : {}),
        ...(validFrom !== undefined
          ? { validFrom: validFrom ? new Date(validFrom) : null }
          : {}),
        ...(validUntil !== undefined
          ? { validUntil: validUntil ? new Date(validUntil) : null }
          : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    return NextResponse.json(promo);
  } catch (err) {
    console.error("[admin/promos/PATCH] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du code promo" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  const promo = await prisma.promoCode.findUnique({
    where: { id },
    include: { _count: { select: { redemptions: true } } },
  });

  if (!promo) {
    return NextResponse.json({ error: "Code promo introuvable" }, { status: 404 });
  }

  if (promo._count.redemptions > 0) {
    return NextResponse.json(
      { error: "Ce code a déjà été utilisé, il ne peut plus être supprimé. Désactive-le plutôt." },
      { status: 409 }
    );
  }

  await prisma.promoCode.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
