"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PartyPopper } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart/CartContext";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

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
          Merci pour votre commande&nbsp;!
        </h1>

        <p className="font-sans text-lg text-text-body mb-8">
          Vous allez recevoir un email de confirmation dans quelques instants.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/epicerie"
            className="px-6 py-3 rounded-xl bg-orange text-blanc font-semibold hover:bg-orange-vif transition-colors"
          >
            Continuer mes achats
          </Link>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl font-semibold border-2 border-orange text-orange hover:bg-orange/5 transition-colors"
          >
            Retour &agrave; l&rsquo;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-text-body">Chargement…</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
