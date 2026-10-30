import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Truck, ShoppingCart, Utensils } from "lucide-react";
import { prisma } from "@/lib/prisma";
import LacDishCard from "@/components/public/LacDishCard";
import LacDeadlineCountdown from "@/components/public/LacDeadlineCountdown";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Lunch After Church",
  description:
    "Le menu du dimanche préparé avec amour par Misou. Commandez avant la deadline et choisissez entre retrait et livraison locale.",
};

function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDeadlineFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }) + " à " + date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function LacPage() {
  const now = new Date();
  const upcomingMenu = await prisma.lacMenu.findFirst({
    where: {
      isPublished: true,
      serviceDate: { gte: now },
    },
    include: {
      dishes: { orderBy: { position: "asc" } },
    },
    orderBy: { serviceDate: "asc" },
  });

  if (!upcomingMenu) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-blanc-creme via-blanc-chaud to-jaune-clair/20 px-4">
        <div className="max-w-2xl text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-orange font-sans font-medium mb-6">
            Lunch After Church
          </p>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-marron-profond mb-6">
            Lunch After Church
          </h1>
          <p className="text-lg md:text-xl text-text-body font-sans leading-relaxed max-w-lg mx-auto mb-10">
            Le menu du dimanche arrive bientôt. Revenez nous voir en début de semaine.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-marron-profond text-marron-profond font-sans font-semibold hover:bg-marron-profond hover:text-white transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </section>
    );
  }

  const deadlinePassed = now > upcomingMenu.orderDeadline;
  const deadlineApproaching =
    !deadlinePassed &&
    upcomingMenu.orderDeadline.getTime() - now.getTime() < 24 * 60 * 60 * 1000;

  const serviceDateStr = formatDateFr(upcomingMenu.serviceDate);
  const deadlineStr = formatDeadlineFr(upcomingMenu.orderDeadline);

  return (
    <div>
      {/* Hero */}
      <section className="bg-blanc-creme px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-orange uppercase tracking-widest text-sm font-sans font-medium">
            Lunch After Church
          </p>
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-marron-profond">
            Le menu du {serviceDateStr}
          </h1>
          <p className="text-lg text-text-body font-sans max-w-2xl mx-auto">
            Un rendez-vous hebdomadaire avec les saveurs d&rsquo;Ha&iuml;ti.
            Commandez avant {deadlineStr}.
          </p>

          {deadlinePassed && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-2xl mx-auto">
              <p className="font-sans text-sm font-semibold text-red-700">
                Les commandes sont fermées pour ce dimanche. Le prochain menu arrive bientôt.
              </p>
            </div>
          )}

          {deadlineApproaching && !deadlinePassed && (
            <LacDeadlineCountdown
              deadline={upcomingMenu.orderDeadline.toISOString()}
            />
          )}
        </div>
      </section>

      {/* Delivery zone */}
      {upcomingMenu.deliveryZoneText && (
        <section className="px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-blanc rounded-2xl p-6 border border-marron-profond/10 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center shrink-0">
                <Truck size={20} className="text-orange" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-marron-profond mb-1">
                  Zone de livraison
                </h3>
                <p className="font-sans text-sm text-text-body">
                  {upcomingMenu.deliveryZoneText}
                </p>
                <p className="font-sans text-xs text-gris-chaud mt-1">
                  Ou retrait sur place possible.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dishes grid */}
      <section className="px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMenu.dishes.map((dish) => (
              <LacDishCard
                key={dish.id}
                lacMenuId={upcomingMenu.id}
                dish={{
                  id: dish.id,
                  name: dish.name,
                  description: dish.description,
                  photoUrl: dish.photoUrl,
                  price: Number(dish.price),
                  maxQuantity: dish.maxQuantity,
                }}
                deadlinePassed={deadlinePassed}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-12 bg-blanc-creme">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-2xl text-marron-profond text-center mb-8">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blanc rounded-2xl p-6 text-center shadow-sm border border-marron-profond/5">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart size={22} className="text-orange" />
              </div>
              <h3 className="font-serif text-lg text-marron-profond mb-2">
                Commandez
              </h3>
              <p className="font-sans text-sm text-text-body">
                Choisissez vos plats et passez commande avant {deadlineStr}.
              </p>
            </div>
            <div className="bg-blanc rounded-2xl p-6 text-center shadow-sm border border-marron-profond/5">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-4">
                <Utensils size={22} className="text-orange" />
              </div>
              <h3 className="font-serif text-lg text-marron-profond mb-2">
                Misou cuisine
              </h3>
              <p className="font-sans text-sm text-text-body">
                Tout est préparé avec amour le dimanche matin.
              </p>
            </div>
            <div className="bg-blanc rounded-2xl p-6 text-center shadow-sm border border-marron-profond/5">
              <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center mx-auto mb-4">
                <Utensils size={22} className="text-orange" />
              </div>
              <h3 className="font-serif text-lg text-marron-profond mb-2">
                Vous vous régalez
              </h3>
              <p className="font-sans text-sm text-text-body">
                Retrait sur place ou livraison locale, selon votre préférence.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
