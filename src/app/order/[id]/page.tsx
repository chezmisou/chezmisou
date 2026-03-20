"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle, Package, ChefHat, Truck, Home } from "lucide-react";
import { useEffect, useState } from "react";

const ORDER_STEPS = [
  { key: "received", label: "Resevwa", labelFr: "Reçue", icon: CheckCircle },
  { key: "preparing", label: "Ap prepare", labelFr: "En préparation", icon: ChefHat },
  { key: "ready", label: "Pare", labelFr: "Prête", icon: Package },
  { key: "delivering", label: "Ap livre", labelFr: "En livraison", icon: Truck },
  { key: "delivered", label: "Livre", labelFr: "Livrée", icon: Home },
];

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const currentStep = 0; // Simulated: order just received

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 text-center">
      {/* Confetti animation placeholder */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}

      {/* Success */}
      <div className="mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-brand-green/10 flex items-center justify-center">
          <CheckCircle size={40} className="text-brand-green" />
        </div>
        <h1 className="font-display text-3xl font-bold text-brand-green mb-2">
          Mèsi anpil!
        </h1>
        <p className="text-brand-brown/70">Merci beaucoup! Votre commande a été reçue.</p>
      </div>

      {/* Order Number */}
      <div className="card p-6 mb-8 inline-block">
        <p className="text-sm text-brand-brown/50 mb-1">Nimewo kòmand / Numéro de commande</p>
        <p className="font-mono text-2xl font-bold text-brand-blue">{id}</p>
      </div>

      {/* Order Status */}
      <div className="card p-6 mb-8 text-left">
        <h2 className="font-semibold mb-6 text-center">Sitiyasyon Kòmand / Statut</h2>
        <div className="flex items-center justify-between relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200">
            <div
              className="h-full bg-brand-green transition-all duration-500"
              style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {ORDER_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = idx <= currentStep;
            return (
              <div key={step.key} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-brand-green text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-[10px] mt-2 font-medium ${
                    isActive ? "text-brand-green" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/" className="btn-primary w-full text-center block">
          Retounen Lakay
        </Link>
        <Link
          href="/traiteur"
          className="btn-outline w-full text-center block"
        >
          Kòmande ankò
        </Link>
      </div>
    </div>
  );
}
