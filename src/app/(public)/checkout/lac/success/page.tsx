"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { useLacCart } from "@/lib/cart/LacCartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useLacCart();

  useEffect(() => {
    if (!sessionId) {
      router.replace("/");
      return;
    }
    clearCart();
  }, [sessionId, clearCart, router]);

  if (!sessionId) return null;

  return (
    <section className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-600">
          <PartyPopper size={36} className="text-white" />
        </div>

        <h1 className="font-serif text-3xl md:text-4xl text-marron-profond mb-4">
          Commande confirmée !
        </h1>

        <p className="font-sans text-lg text-text-body mb-8">
          Rendez-vous dimanche pour un repas qui vous ramènera au pays.
          Un email de confirmation vient de vous être envoyé.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors font-sans"
          >
            Continuer sur le site
          </Link>
          <Link
            href="/lac"
            className="px-6 py-3 rounded-xl font-semibold border-2 border-orange text-orange hover:bg-orange/5 transition-colors font-sans"
          >
            Revoir le menu
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutLacSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-body font-sans">Chargement…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
