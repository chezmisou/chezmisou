import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blanc-creme px-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-widest text-orange mb-4">
          Erreur 404
        </p>
        <h1 className="font-serif text-5xl text-marron-profond mb-4">
          Page introuvable
        </h1>
        <p className="text-text-body mb-8">
          La page que vous cherchez semble s&rsquo;&ecirc;tre &eacute;chapp&eacute;e de la cuisine.
          Peut-&ecirc;tre un d&eacute;tour par l&rsquo;accueil&nbsp;?
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-orange text-white font-semibold hover:bg-orange-vif transition-colors"
        >
          Retour &agrave; l&rsquo;accueil
        </Link>
      </div>
    </div>
  );
}
