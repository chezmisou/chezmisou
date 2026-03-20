"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { SAMPLE_PRODUCTS } from "@/lib/data";
import ProductCard from "@/components/ui/ProductCard";

function getNextSaturdayDeadline(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() + daysUntilSaturday);
  saturday.setHours(20, 0, 0, 0);
  return saturday;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Commandes fermées";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}j ${remainingHours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m ${seconds}s`;
}

const DELIVERY_SLOTS = ["11h - 12h", "12h - 13h", "13h - 14h"];

// Simulated weekly menu - subset of products
const WEEKLY_MENU = SAMPLE_PRODUCTS.filter((p) =>
  ["poulet-creole", "diri-kole-pwa", "sos-pwa-nwa", "griyo", "kremas", "pikliz"].includes(p.id)
);

export default function LunchAfterChurchPage() {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const deadline = getNextSaturdayDeadline();

  useEffect(() => {
    const update = () => setTimeLeft(deadline.getTime() - Date.now());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const isClosed = timeLeft <= 0;

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-brand-green text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">⛪</span>
            <span className="text-brand-gold text-xs font-semibold tracking-wider uppercase">
              Chaque Dimanche
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Lunch After Church
          </h1>
          <p className="text-white/80 max-w-xl mb-6">
            Commandez avant samedi 20h et recevez votre repas chaud après la messe.
            Un dimanche sans cuisine, un dimanche en famille.
          </p>

          {/* Countdown */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${isClosed ? "bg-brand-red/80" : "bg-white/20"}`}>
            <Clock size={18} />
            <span className="font-mono font-bold">
              {isClosed ? (
                "Commandes fermées pour ce dimanche"
              ) : (
                <>Temps restant: {formatCountdown(timeLeft)}</>
              )}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Delivery Slots */}
        <div className="mb-8">
          <h2 className="font-semibold text-lg mb-3">Créneau de livraison dimanche</h2>
          <div className="flex gap-3 flex-wrap">
            {DELIVERY_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`px-5 py-3 rounded-xl border-2 font-medium transition-all ${
                  selectedSlot === slot
                    ? "border-brand-green bg-brand-green/10 text-brand-green"
                    : "border-gray-200 hover:border-brand-green/50"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle size={20} className="text-brand-gold flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-brand-brown">Comment ça marche?</p>
            <p className="text-brand-brown/70 mt-1">
              Choisissez vos plats et votre créneau de livraison. Les commandes ferment
              le samedi à 20h. Votre repas sera livré chaud le dimanche dans le créneau choisi.
            </p>
          </div>
        </div>

        {/* Menu */}
        <h2 className="section-title mb-6">Menu de la Semaine</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {WEEKLY_MENU.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {WEEKLY_MENU.length === 0 && (
          <div className="text-center py-16">
            <span className="text-4xl mb-4 block">🍽️</span>
            <p className="text-brand-brown/50 text-lg">
              Le menu de cette semaine sera bientôt disponible
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
