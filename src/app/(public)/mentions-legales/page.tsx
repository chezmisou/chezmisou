import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Chez Misou : éditeur, hébergement, propriété intellectuelle, données personnelles et cookies.",
};

function LegalPlaceholderBanner() {
  if (process.env.NEXT_PUBLIC_LEGAL_PLACEHOLDER !== "true") return null;
  return (
    <div className="bg-jaune-clair border-l-4 border-orange p-4 rounded text-marron-profond mb-8">
      ⚠️ Document mod&egrave;le &agrave; compl&eacute;ter et faire v&eacute;rifier. Les informations
      sp&eacute;cifiques &agrave; Chez Misou (SIRET, adresse du si&egrave;ge, h&eacute;bergeur, coordonn&eacute;es
      exactes) doivent &ecirc;tre renseign&eacute;es avant la mise en ligne en production.
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <LegalPlaceholderBanner />

      <h1 className="font-serif text-4xl text-marron-profond mb-8">
        Mentions l&eacute;gales
      </h1>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          &Eacute;diteur du site
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>
            Le site chezmisou.com est &eacute;dit&eacute; par [&agrave; compl&eacute;ter : nom ou raison
            sociale de l&rsquo;entreprise], [&agrave; compl&eacute;ter : forme juridique &mdash;
            micro-entreprise, EURL, SAS…], immatricul&eacute;e au registre du commerce
            et des soci&eacute;t&eacute;s sous le num&eacute;ro SIRET [&agrave; compl&eacute;ter].
          </p>
          <p>Si&egrave;ge social : [&agrave; compl&eacute;ter : adresse compl&egrave;te].</p>
          <p>
            Num&eacute;ro de TVA intracommunautaire : [&agrave; compl&eacute;ter le cas &eacute;ch&eacute;ant].
          </p>
          <p>
            Directrice de la publication : Misou [&agrave; compl&eacute;ter : nom de famille].
          </p>
          <p>Contact : contact@chezmisou.com.</p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          H&eacute;bergement
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>
            Le site est h&eacute;berg&eacute; par Vercel Inc., 340 S Lemon Ave #4133, Walnut,
            CA 91789, &Eacute;tats-Unis. Site : https://vercel.com.
          </p>
          <p>
            La base de donn&eacute;es est h&eacute;berg&eacute;e par Supabase Inc., 970 Toa Payoh
            North #07-04, Singapour 318992. Site : https://supabase.com.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Propri&eacute;t&eacute; intellectuelle
        </h2>
        <p className="text-text-body leading-relaxed">
          L&rsquo;ensemble des contenus pr&eacute;sents sur ce site (textes, images, logo,
          charte graphique, mises en page) sont la propri&eacute;t&eacute; exclusive de Chez
          Misou ou de ses partenaires, et sont prot&eacute;g&eacute;s par le droit d&rsquo;auteur.
          Toute reproduction, m&ecirc;me partielle, sans autorisation &eacute;crite pr&eacute;alable
          est interdite.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Donn&eacute;es personnelles
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>
            Les informations collect&eacute;es via les formulaires du site (commandes,
            demandes de devis, contact) sont destin&eacute;es uniquement &agrave; Chez Misou
            pour le traitement des commandes, la livraison et la relation client.
            Aucune donn&eacute;e n&rsquo;est revendue &agrave; des tiers.
          </p>
          <p>
            Conform&eacute;ment au RGPD, vous disposez d&rsquo;un droit d&rsquo;acc&egrave;s, de
            rectification, de suppression et de portabilit&eacute; de vos donn&eacute;es. Pour
            exercer ces droits, &eacute;crivez &agrave; contact@chezmisou.com.
          </p>
          <p>
            Voir la page &laquo;&nbsp;Politique de confidentialit&eacute;&nbsp;&raquo; pour plus de d&eacute;tails.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">Cookies</h2>
        <p className="text-text-body leading-relaxed">
          Le site utilise des cookies techniques n&eacute;cessaires &agrave; son bon
          fonctionnement (panier, session admin). Aucun cookie publicitaire ou de
          tra&ccedil;age tiers n&rsquo;est d&eacute;ploy&eacute;.
        </p>
      </section>

      <p className="text-text-body mt-12 text-sm italic">
        Derni&egrave;re mise &agrave; jour : 8 avril 2026.
      </p>
    </main>
  );
}
