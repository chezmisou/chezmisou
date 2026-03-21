import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/epicerie-fine/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.epicerieProduct.findUnique({
    where: { id: params.id },
    include: { categoryInfo: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// PUT /api/epicerie-fine/products/:id
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json();
  const { nameFr, nameCr, category, size, price, image, isActive } = body;

  const product = await prisma.epicerieProduct.update({
    where: { id: params.id },
    data: {
      ...(nameFr != null ? { nameFr } : {}),
      ...(nameCr != null ? { nameCr } : {}),
      ...(category != null ? { category: category.toUpperCase() } : {}),
      ...(size != null ? { size } : {}),
      ...(price != null ? { price } : {}),
      ...(image != null ? { image } : {}),
      ...(isActive != null ? { isActive } : {}),
    },
    include: { categoryInfo: true },
  });

  return NextResponse.json(product);
}
