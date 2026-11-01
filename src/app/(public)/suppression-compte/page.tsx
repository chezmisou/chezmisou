import type { Metadata } from "next";
import DeleteAccountPanel from "./DeleteAccountPanel";

export const metadata: Metadata = {
  title: "Supprimer mon compte",
  description:
    "Supprimez votre compte client Chez Misou (site et application mobile) et vos données personnelles associées.",
};

export default function SuppressionComptePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="font-serif text-3xl md:text-4xl text-marron-profond mb-4">
        Supprimer mon compte
      </h1>
      <p className="font-sans text-text-body mb-6">
        Cette page concerne votre compte client Chez Misou, utilisé sur le site chezmisou.com et dans
        l&rsquo;application mobile Chez Misou.
      </p>

      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-profond/5 mb-6 font-sans text-sm text-text-body space-y-3">
        <h2 className="font-serif text-xl text-marron-profond">Ce qui est supprimé</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>votre compte de connexion (email, mot de passe, connexion Google ou Apple) ;</li>
          <li>vos adresses enregistrées et vos avis ;</li>
          <li>votre numéro de téléphone.</li>
        </ul>
        <h2 className="font-serif text-xl text-marron-profond pt-2">Ce qui est conservé</h2>
        <p>
          Les commandes déjà passées (nom, montant, articles) sont conservées le temps imposé par
          les obligations comptables, puis supprimées. Elles ne sont plus rattachées à un compte.
        </p>
        <p>La suppression est immédiate et définitive.</p>
      </div>

      <DeleteAccountPanel />

      <p className="font-sans text-sm text-gris-chaud mt-8">
        Vous ne pouvez plus vous connecter ? Écrivez à{" "}
        <a href="mailto:contact@chezmisou.com?subject=Suppression%20de%20mon%20compte" className="text-orange underline">
          contact@chezmisou.com
        </a>{" "}
        depuis l&rsquo;adresse de votre compte : la suppression est faite sous 30 jours.
      </p>
    </div>
  );
}
