import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTraiteurEnabled } from "@/lib/settings";
import { isCurrentUserAdmin } from "@/lib/auth/requireAdmin";
import { num } from "@/lib/mobile/serialize";

export const dynamic = "force-dynamic";

/** Traiteur : plats et formats, ou « bientôt disponible » tant que fermé. */
export async function GET() {
  const enabled = await isTraiteurEnabled();
  const preview = !enabled && (await isCurrentUserAdmin());
  if (!enabled && !preview) {
    return NextResponse.json({ enabled: false, preview: false, dishes: [] });
  }

  const dishes = await prisma.traiteurDish.findMany({
    where: { isActive: true },
    include: { formats: { orderBy: { minPeople: "asc" } } },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  return NextResponse.json({
    enabled,
    preview,
    dishes: dishes.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      photoUrl: d.photoUrl,
      category: d.category || "Autres",
      baseInfo: d.baseInfo,
      formats: d.formats.map((f) => ({
        id: f.id,
        minPeople: f.minPeople,
        maxPeople: f.maxPeople,
        pricePerPerson: num(f.indicativePricePerPerson),
      })),
    })),
  });
}
