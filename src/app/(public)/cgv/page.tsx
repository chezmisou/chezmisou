import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description:
    "Conditions Générales de Vente de Chez Misou : commandes, paiement, livraison, droit de rétractation et responsabilité.",
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

export default function CgvPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <LegalPlaceholderBanner />

      <h1 className="font-serif text-4xl text-marron-profond mb-8">
        Conditions G&eacute;n&eacute;rales de Vente
      </h1>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 1 &mdash; Objet
        </h2>
        <p className="text-text-body leading-relaxed">
          Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (CGV) r&eacute;gissent les
          relations commerciales entre Chez Misou, [&agrave; compl&eacute;ter : forme
          juridique], et toute personne physique ou morale (le &laquo;&nbsp;Client&nbsp;&raquo;)
          passant commande sur le site chezmisou.com pour les services suivants :
          vente de produits d&rsquo;&eacute;picerie fine, service de Lunch After Church et
          prestations traiteur sur devis.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 2 &mdash; Acceptation des CGV
        </h2>
        <p className="text-text-body leading-relaxed">
          Toute commande implique l&rsquo;acceptation pleine et enti&egrave;re des pr&eacute;sentes
          CGV par le Client. Chez Misou se r&eacute;serve le droit de modifier ces CGV &agrave;
          tout moment ; les CGV applicables sont celles en vigueur &agrave; la date de
          la commande.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 3 &mdash; Produits et services
        </h2>
        <p className="text-text-body leading-relaxed">
          Les produits et services propos&eacute;s sont d&eacute;crits et pr&eacute;sent&eacute;s avec la
          plus grande exactitude possible. Les photographies sont non
          contractuelles. Chez Misou se r&eacute;serve le droit de modifier &agrave; tout
          moment l&rsquo;assortiment de produits propos&eacute;s et de retirer un produit de
          la vente.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 4 &mdash; Prix
        </h2>
        <p className="text-text-body leading-relaxed">
          Les prix sont indiqu&eacute;s en euros, toutes taxes comprises (TTC), hors
          frais de livraison. Les frais de livraison sont pr&eacute;cis&eacute;s avant
          validation de la commande. Chez Misou se r&eacute;serve le droit de modifier
          ses prix &agrave; tout moment, &eacute;tant entendu que le prix figurant sur le site
          au jour de la commande sera le seul applicable au Client.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 5 &mdash; Commande et paiement
        </h2>
        <p className="text-text-body leading-relaxed">
          Le Client valide sa commande en ligne apr&egrave;s avoir accept&eacute; les pr&eacute;sentes
          CGV. Le paiement s&rsquo;effectue par carte bancaire via Stripe, prestataire
          de paiement s&eacute;curis&eacute;. Pour les prestations traiteur, un devis
          personnalis&eacute; est envoy&eacute; au Client apr&egrave;s &eacute;tude de sa demande ; les
          modalit&eacute;s de paiement sont pr&eacute;cis&eacute;es dans le devis.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 6 &mdash; Livraison &mdash; &Eacute;picerie fine
        </h2>
        <p className="text-text-body leading-relaxed">
          Les produits d&rsquo;&eacute;picerie sont livr&eacute;s en France m&eacute;tropolitaine sous 3 &agrave; 5
          jours ouvr&eacute;s apr&egrave;s confirmation de paiement. Les frais de livraison
          sont de [&agrave; compl&eacute;ter : montant] euros, offerts &agrave; partir de [&agrave;
          compl&eacute;ter : seuil] euros d&rsquo;achat.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 7 &mdash; Lunch After Church (LAC)
        </h2>
        <p className="text-text-body leading-relaxed">
          Les commandes LAC doivent &ecirc;tre pass&eacute;es avant la date limite indiqu&eacute;e
          sur le site (g&eacute;n&eacute;ralement le samedi 18h pour le dimanche). Deux modes
          de r&eacute;cup&eacute;ration sont possibles : retrait sur place &agrave; l&rsquo;adresse
          communiqu&eacute;e par email, ou livraison locale (dans la zone indiqu&eacute;e,
          suppl&eacute;ment de [&agrave; compl&eacute;ter] euros). Pass&eacute; la deadline, aucune commande
          ne peut &ecirc;tre accept&eacute;e ni modifi&eacute;e.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 8 &mdash; Droit de r&eacute;tractation
        </h2>
        <p className="text-text-body leading-relaxed">
          Conform&eacute;ment &agrave; l&rsquo;article L221-28 du Code de la consommation, le droit
          de r&eacute;tractation ne peut &ecirc;tre exerc&eacute; pour les biens susceptibles de se
          d&eacute;t&eacute;riorer ou de se p&eacute;rimer rapidement (produits alimentaires frais,
          plats pr&eacute;par&eacute;s du service LAC). Pour les produits d&rsquo;&eacute;picerie non
          p&eacute;rissables et non d&eacute;cachet&eacute;s, le Client dispose d&rsquo;un d&eacute;lai de 14 jours
          apr&egrave;s r&eacute;ception pour exercer son droit de r&eacute;tractation, en contactant
          contact@chezmisou.com.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 9 &mdash; Garanties et responsabilit&eacute;
        </h2>
        <p className="text-text-body leading-relaxed">
          Chez Misou s&rsquo;engage &agrave; fournir des produits conformes aux normes
          sanitaires en vigueur. En cas de produit d&eacute;fectueux &agrave; la livraison, le
          Client est invit&eacute; &agrave; contacter contact@chezmisou.com dans les 48h avec
          photos &agrave; l&rsquo;appui. Une solution (remboursement, remplacement ou avoir)
          sera propos&eacute;e au cas par cas.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 10 &mdash; Donn&eacute;es personnelles
        </h2>
        <p className="text-text-body leading-relaxed">
          Voir la page &laquo;&nbsp;Politique de confidentialit&eacute;&nbsp;&raquo;.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Article 11 &mdash; Litiges
        </h2>
        <p className="text-text-body leading-relaxed">
          Les pr&eacute;sentes CGV sont soumises au droit fran&ccedil;ais. En cas de litige,
          une solution amiable sera recherch&eacute;e avant toute action judiciaire. &Agrave;
          d&eacute;faut, les tribunaux fran&ccedil;ais seront seuls comp&eacute;tents.
        </p>
      </section>

      <p className="text-text-body mt-12 text-sm italic">
        Derni&egrave;re mise &agrave; jour : 8 avril 2026.
      </p>
    </main>
  );
}
