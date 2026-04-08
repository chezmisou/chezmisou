import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

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

    if (!code || !discountType || discountValue == null) {
      return NextResponse.json(
        { error: "Les champs code, type de remise et valeur sont requis" },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();
    if (normalizedCode.length < 3 || normalizedCode.length > 20 || !/^[A-Z0-9]+$/.test(normalizedCode)) {
      return NextResponse.json(
        { error: "Le code doit contenir entre 3 et 20 caractères alphanumériques" },
        { status: 400 }
      );
    }

    const existing = await prisma.promoCode.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      return NextResponse.json(
        { error: "Ce code promo existe déjà" },
        { status: 409 }
      );
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: normalizedCode,
        description: description || null,
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        appliesTo: appliesTo || "all",
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        usageLimitPerCustomer: usageLimitPerCustomer ? parseInt(usageLimitPerCustomer) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        isActive: isActive ?? true,
        ...(appliesTo === "specific_products" && productIds?.length
          ? {
              products: {
                create: productIds.map((pid: string) => ({ productId: pid })),
              },
            }
          : {}),
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (err) {
    console.error("[admin/promos] Erreur:", err);
    return NextResponse.json(
      { error: "Erreur lors de la création du code promo" },
      { status: 500 }
    );
  }
}
