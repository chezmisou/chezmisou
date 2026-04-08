import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TraiteurDishCard from "@/components/public/TraiteurDishCard";
import TraiteurQuoteForm from "@/components/public/TraiteurQuoteForm";
import TraiteurStickyBar from "@/components/public/TraiteurStickyBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traiteur",
  description:
    "Anniversaires, fêtes familiales, plateaux repas : Misou cuisine pour vos événements. Demandez votre devis personnalisé.",
};

export default async function TraiteurPage() {
  const dishes = await prisma.traiteurDish.findMany({
    where: { isActive: true },
    include: { formats: { orderBy: { minPeople: "asc" } } },
    orderBy: [{ category: "asc" }, { position: "asc" }],
  });

  // Group by category
  const categories = new Map<string, typeof dishes>();
  for (const dish of dishes) {
    const cat = dish.category || "Autres";
    const arr = categories.get(cat) || [];
    arr.push(dish);
    categories.set(cat, arr);
  }

  // Serialize for client components
  const dishesForForm = dishes.map((d) => ({
    id: d.id,
    name: d.name,
    category: d.category,
    formats: d.formats.map((f) => ({
      id: f.id,
      minPeople: f.minPeople,
      maxPeople: f.maxPeople,
      indicativePricePerPerson: Number(f.indicativePricePerPerson),
    })),
  }));

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-marron-profond via-marron to-marron-profond text-blanc py-20 md:py-28 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-4">
            Service traiteur
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Traiteur
          </h1>
          <p className="text-lg md:text-xl text-blanc-creme/80 font-sans leading-relaxed max-w-2xl mx-auto">
            Offrez à vos invités un repas qui ne ressemble à aucun autre.
            Anniversaires, fêtes familiales, plateaux repas : Misou cuisine pour
            vos événements.
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-16 md:py-20 px-4 bg-blanc-creme">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-marron-profond text-center mb-12">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choisissez vos plats",
                desc: "Composez votre sélection parmi nos spécialités haïtiennes.",
              },
              {
                step: "2",
                title: "Envoyez votre demande",
                desc: "Indiquez la date, le nombre de personnes et vos préférences.",
              },
              {
                step: "3",
                title: "Misou vous rappelle",
                desc: "Sous 48h, vous recevez un devis personnalisé et on finalise ensemble.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-orange text-blanc rounded-full flex items-center justify-center font-serif text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-serif text-lg font-bold text-marron-profond mb-2">
                  {item.title}
                </h3>
                <p className="text-text-body text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-marron-profond text-center mb-12">
            Nos plats
          </h2>

          {dishes.length === 0 ? (
            <p className="text-center text-gris-chaud text-lg">
              Le catalogue est en cours de préparation. Revenez bientôt !
            </p>
          ) : (
            <div className="space-y-12">
              {Array.from(categories.entries()).map(([category, catDishes]) => (
                <div key={category}>
                  <h3 className="font-serif text-xl font-bold text-marron-profond mb-6 border-b border-marron-doux/20 pb-2">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catDishes.map((dish) => (
                      <TraiteurDishCard
                        key={dish.id}
                        dish={{
                          id: dish.id,
                          name: dish.name,
                          description: dish.description,
                          photoUrl: dish.photoUrl,
                          category: dish.category,
                          formats: dish.formats.map((f) => ({
                            id: f.id,
                            minPeople: f.minPeople,
                            maxPeople: f.maxPeople,
                            indicativePricePerPerson: Number(
                              f.indicativePricePerPerson
                            ),
                          })),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Formulaire */}
      <section
        id="devis-form"
        className="py-16 md:py-20 px-4 bg-blanc-creme"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-marron-profond text-center mb-4">
            Demander un devis
          </h2>
          <p className="text-center text-text-body mb-10">
            Remplissez le formulaire ci-dessous et Misou vous recontactera sous 48h.
          </p>
          <div className="bg-blanc rounded-2xl p-6 md:p-8 shadow-sm border border-marron-doux/20">
            <TraiteurQuoteForm dishes={dishesForForm} />
          </div>
        </div>
      </section>

      {/* Sticky bar mobile */}
      <TraiteurStickyBar />
    </>
  );
}
