"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function InscriptionPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const handleGoogle = async () => {
    setError("");
    setInfo("");
    setGoogleLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/compte`,
        },
      });
      if (oauthError) {
        setError("Impossible de s'inscrire avec Google pour le moment.");
        setGoogleLoading(false);
      }
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            firstName: firstName.trim() || undefined,
            lastName: lastName.trim() || undefined,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/compte`,
        },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes("already")) {
          setError("Un compte existe déjà avec cet email.");
        } else if (
          signUpError.message.toLowerCase().includes("password")
        ) {
          setError("Mot de passe trop court (6 caractères minimum).");
        } else {
          setError("Impossible de créer le compte. Merci de réessayer.");
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/compte");
        router.refresh();
      } else {
        setInfo(
          "Votre compte est créé ! Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous."
        );
        setLoading(false);
      }
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-blanc-creme p-4 py-12">
      <div className="bg-blanc rounded-2xl p-8 max-w-sm w-full shadow-lg border border-marron-doux/20">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-chez-misou.png"
            alt="Chez Misou"
            width={72}
            height={72}
            className="rounded-full"
          />
        </div>

        <h1 className="font-serif text-2xl font-bold text-marron-profond text-center mb-1">
          Bienvenue chez Misou
        </h1>
        <p className="text-gris-chaud text-sm text-center mb-6">
          Créez un compte pour suivre vos commandes facilement.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
            {info}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-blanc border border-marron-doux/30 text-marron-profond py-3 rounded-xl font-medium hover:bg-blanc-creme transition-colors disabled:opacity-50 mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.96 10.71a5.41 5.41 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l3-2.33z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
            />
          </svg>
          {googleLoading ? "Redirection…" : "Continuer avec Google"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-marron-doux/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-blanc px-3 text-gris-chaud">ou avec votre email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-marron-profond mb-1"
              >
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                placeholder="Misou"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-marron-profond mb-1"
              >
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
                placeholder="Lakay"
              />
            </div>
          </div>

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
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
              placeholder="vous@example.com"
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
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-marron-doux/30 bg-blanc-creme text-marron-profond placeholder-gris-chaud focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange"
              placeholder="Au moins 6 caractères"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange text-blanc py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors disabled:opacity-50"
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-sm text-center text-gris-chaud mt-6">
          Déjà un compte ?{" "}
          <Link
            href="/connexion"
            className="text-orange font-medium hover:text-orange-vif"
          >
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}
