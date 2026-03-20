import { NextResponse } from "next/server";
import { SAMPLE_PRODUCTS } from "@/lib/data";

// GET /api/products — List all products
export async function GET() {
  // In production, fetch from database via Prisma
  return NextResponse.json(SAMPLE_PRODUCTS);
}
