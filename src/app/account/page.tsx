"use client";

import Link from "next/link";
import { User, MapPin, CreditCard, Heart, Clock, ArrowRight } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="section-title mb-2">Kont Mwen</h1>
      <p className="text-brand-brown/60 text-sm mb-8">Mon Compte</p>

      {/* Not logged in state */}
      <div className="card p-8 text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-blue/10 flex items-center justify-center">
          <User size={28} className="text-brand-blue" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">Byenvini!</h2>
        <p className="text-brand-brown/60 text-sm mb-4">
          Kreye yon kont pou swiv kòmand ou yo ak sove adrès ou.
        </p>
        <p className="text-brand-brown/40 text-xs mb-6">
          Créez un compte pour suivre vos commandes et sauvegarder vos adresses.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="btn-primary text-sm">Enskri / S&apos;inscrire</button>
          <button className="btn-outline text-sm">Konekte / Connexion</button>
        </div>
      </div>

      {/* Account menu items */}
      <div className="space-y-3">
        {[
          { icon: Clock, label: "Istwa Kòmand", sublabel: "Historique des commandes", href: "#" },
          { icon: MapPin, label: "Adrès Mwen", sublabel: "Mes adresses", href: "#" },
          { icon: CreditCard, label: "Pèman", sublabel: "Méthodes de paiement", href: "#" },
          { icon: Heart, label: "Preferans", sublabel: "Préférences alimentaires", href: "#" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <item.icon size={20} className="text-brand-blue" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-brand-brown/50">{item.sublabel}</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-brand-brown/30" />
          </Link>
        ))}
      </div>
    </div>
  );
}
