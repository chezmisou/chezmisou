"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError("Identifiants incorrects");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/check-allowed-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.user?.email }),
      });
      const { allowed } = await res.json();

      if (!allowed) {
        await supabase.auth.signOut();
        setError("Vous n'êtes pas autorisé à accéder à l'admin");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blanc-creme p-4">
      <div className="bg-blanc rounded-2xl p-8 max-w-sm w-full shadow-lg border border-marron-doux/20">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-chez-misou.png"
            alt="Chez Misou"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>

        <h1 className="font-serif text-2xl font-bold text-marron-profond text-center mb-1">
          Espace administration
        </h1>
        <p className="text-gris-chaud text-sm text-center mb-6">
          Connexion réservée à Misou et son équipe
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-marron-profond mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
              placeholder="misou@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-marron-profond mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange text-blanc py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
