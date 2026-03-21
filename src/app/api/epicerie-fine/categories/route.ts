import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/epicerie-fine/categories
export async function GET() {
  const categories = await prisma.epicerieCategoryInfo.findMany({
    orderBy: { key: "asc" },
  });

  return NextResponse.json(categories);
}
