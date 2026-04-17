"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import OrdersList, { type OrderDTO } from "./OrdersList";

export default function GuestOrderSearch() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders/by-email?email=${encodeURIComponent(email.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-orange/10 border border-orange/30 rounded-xl p-4 mb-6 text-sm text-marron-profond">
        Vous avez un compte ?{" "}
        <Link
          href="/connexion"
          className="text-orange font-semibold hover:text-orange-vif underline"
        >
          Connectez-vous
        </Link>{" "}
        pour retrouver automatiquement toutes vos commandes.
      </div>

      <p className="text-text-body mb-6">
        Entrez l&apos;adresse email utilisée lors de votre commande pour la retrouver.
      </p>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre adresse email"
            required
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gris-chaud"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange text-blanc px-6 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
        >
          {loading ? "Recherche…" : "Rechercher"}
        </button>
      </form>

      {searched && !loading && <OrdersList orders={orders} />}
    </>
  );
}
