import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/epicerie-fine/products — List all products (public: only active, admin: all)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const showAll = searchParams.get("all") === "true";

  const session = await getServerSession(authOptions);
  const isAdmin =
    session?.user &&
    ((session.user as any).role === "ADMIN" ||
      (session.user as any).role === "SUPER_ADMIN");

  const where: any = {};
  if (!isAdmin || !showAll) {
    where.isActive = true;
  }
  if (category) {
    where.category = category.toUpperCase();
  }

  const products = await prisma.epicerieProduct.findMany({
    where,
    include: { categoryInfo: true },
    orderBy: [{ category: "asc" }, { price: "asc" }],
  });

  return NextResponse.json(products);
}

// POST /api/epicerie-fine/products — Create a new product (admin only)
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { nameFr, nameCr, category, size, price, image } = body;

  if (!nameFr || !nameCr || !category || !size || price == null) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const product = await prisma.epicerieProduct.create({
    data: {
      nameFr,
      nameCr,
      category: category.toUpperCase(),
      size,
      price,
      defaultPrice: price,
      image: image || "🫙",
    },
    include: { categoryInfo: true },
  });

  return NextResponse.json(product, { status: 201 });
}

// PATCH /api/epicerie-fine/products — Bulk update prices
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { updates } = body as { updates: { id: string; price?: number; isActive?: boolean }[] };

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json({ error: "Format invalide" }, { status: 400 });
  }

  const results = await Promise.all(
    updates.map((u) =>
      prisma.epicerieProduct.update({
        where: { id: u.id },
        data: {
          ...(u.price != null ? { price: u.price } : {}),
          ...(u.isActive != null ? { isActive: u.isActive } : {}),
        },
      })
    )
  );

  return NextResponse.json({ updated: results.length });
}
