"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Utensils } from "lucide-react";
import LacDishQuantitySelector from "@/components/public/LacDishQuantitySelector";

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

interface Props {
  lacMenuId: string;
  dish: {
    id: string;
    name: string;
    description: string | null;
    photoUrl: string | null;
    price: number;
    maxQuantity: number | null;
  };
  deadlinePassed: boolean;
}

export default function LacDishCard({ lacMenuId, dish, deadlinePassed }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const selector = (onAdded?: () => void) => (
    <LacDishQuantitySelector
      lacMenuId={lacMenuId}
      lacDishId={dish.id}
      dishName={dish.name}
      dishPhoto={dish.photoUrl}
      price={dish.price}
      maxQuantity={dish.maxQuantity}
      deadlinePassed={deadlinePassed}
      onAdded={onAdded}
    />
  );

  const photo = (sizes: string) =>
    dish.photoUrl ? (
      <Image
        src={dish.photoUrl}
        alt={dish.name}
        fill
        sizes={sizes}
        className="object-cover"
      />
    ) : (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-gris-chaud">
          <Utensils size={48} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm font-sans opacity-50">Photo à venir</p>
        </div>
      </div>
    );

  return (
    <>
      <div className="bg-blanc rounded-2xl overflow-hidden border border-marron-profond/5 shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block w-full aspect-square bg-blanc-creme cursor-pointer"
          aria-label={`Voir le détail : ${dish.name}`}
        >
          {photo("(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw")}
        </button>

        {/* Content */}
        <div className="p-5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-left cursor-pointer"
          >
            <h3 className="font-serif text-2xl text-marron-profond mb-1 hover:text-orange transition-colors">
              {dish.name}
            </h3>
          </button>
          {dish.description && (
            <p className="font-sans text-sm text-text-body line-clamp-3">
              {dish.description}
            </p>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="font-sans text-sm text-orange hover:text-orange-vif font-medium mt-1 mb-3 cursor-pointer"
          >
            Voir le détail
          </button>
          <p className="font-sans text-2xl font-bold text-marron-profond">
            {priceFormatter.format(dish.price)}
          </p>

          {selector()}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={dish.name}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-marron-profond/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-blanc w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-blanc/90 shadow flex items-center justify-center text-marron-profond hover:bg-blanc transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[4/3] bg-blanc-creme">
              {photo("(max-width: 640px) 100vw, 672px")}
            </div>

            <div className="p-6">
              <h2 className="font-serif text-3xl text-marron-profond mb-3">
                {dish.name}
              </h2>
              {dish.description && (
                <p className="font-sans text-base text-text-body leading-relaxed whitespace-pre-line mb-4">
                  {dish.description}
                </p>
              )}
              <p className="font-sans text-2xl font-bold text-marron-profond">
                {priceFormatter.format(dish.price)}
              </p>

              {selector(() => setOpen(false))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
