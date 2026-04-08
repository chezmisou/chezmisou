import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TraiteurDishForm from "@/components/admin/TraiteurDishForm";

export default async function EditTraiteurDishPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dish = await prisma.traiteurDish.findUnique({
    where: { id },
    include: { formats: { orderBy: { minPeople: "asc" } } },
  });

  if (!dish) {
    notFound();
  }

  const initialData = {
    id: dish.id,
    name: dish.name,
    description: dish.description || "",
    category: dish.category || "",
    baseInfo: dish.baseInfo || "",
    photoUrl: dish.photoUrl || "",
    isActive: dish.isActive,
    formats: dish.formats.map((f) => ({
      id: f.id,
      minPeople: f.minPeople,
      maxPeople: f.maxPeople,
      indicativePricePerPerson: Number(f.indicativePricePerPerson),
    })),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/traiteur"
          className="inline-flex items-center gap-1 text-sm text-gris-chaud hover:text-orange transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Retour aux plats traiteur
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Modifier : {dish.name}
        </h1>
      </div>

      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <TraiteurDishForm initialData={initialData} />
      </div>
    </div>
  );
}
