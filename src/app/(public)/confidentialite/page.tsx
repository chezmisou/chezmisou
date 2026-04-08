import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Chez Misou : données collectées, finalités, durée de conservation et exercice de vos droits RGPD.",
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

export default function ConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <LegalPlaceholderBanner />

      <h1 className="font-serif text-4xl text-marron-profond mb-8">
        Politique de confidentialit&eacute;
      </h1>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Responsable du traitement
        </h2>
        <p className="text-text-body leading-relaxed">
          Les donn&eacute;es personnelles collect&eacute;es sur ce site sont trait&eacute;es par Chez
          Misou, [&agrave; compl&eacute;ter : raison sociale], immatricul&eacute;e sous le num&eacute;ro
          SIRET [&agrave; compl&eacute;ter]. Pour toute question relative &agrave; vos donn&eacute;es,
          contactez : contact@chezmisou.com.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Donn&eacute;es collect&eacute;es
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>Nous collectons les donn&eacute;es suivantes :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Lors d&rsquo;une commande : nom, pr&eacute;nom, email, t&eacute;l&eacute;phone, adresse de
              livraison
            </li>
            <li>
              Lors d&rsquo;une demande de devis traiteur : les informations du
              formulaire ci-dessus plus les d&eacute;tails de votre &eacute;v&eacute;nement
            </li>
            <li>
              Via les cookies techniques n&eacute;cessaires au fonctionnement du site
              (panier, session admin) &mdash; aucun cookie de tra&ccedil;age tiers
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Finalit&eacute;s du traitement
        </h2>
        <div className="text-text-body leading-relaxed">
          <p className="mb-3">
            Vos donn&eacute;es sont utilis&eacute;es uniquement pour :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Traiter vos commandes et vous livrer</li>
            <li>Vous envoyer les emails de confirmation et de suivi</li>
            <li>R&eacute;pondre &agrave; vos demandes de devis et de contact</li>
            <li>
              Respecter nos obligations l&eacute;gales (comptabilit&eacute;, conservation des
              factures)
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Base l&eacute;gale
        </h2>
        <div className="text-text-body leading-relaxed">
          <p className="mb-3">Le traitement de vos donn&eacute;es repose sur :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              L&rsquo;ex&eacute;cution d&rsquo;un contrat de vente (commandes, livraisons)
            </li>
            <li>
              Votre consentement (formulaires de contact et de devis)
            </li>
            <li>
              Le respect d&rsquo;obligations l&eacute;gales (conservation des documents
              commerciaux)
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Destinataires
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>
            Vos donn&eacute;es sont accessibles uniquement &agrave; Misou et &agrave; son &eacute;quipe.
            Elles ne sont jamais vendues ni partag&eacute;es avec des tiers &agrave; des fins
            commerciales.
          </p>
          <p>
            Certains prestataires techniques traitent une partie de ces donn&eacute;es
            pour notre compte :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Stripe (paiement) &mdash; Irlande / &Eacute;tats-Unis</li>
            <li>Resend (envoi d&rsquo;emails transactionnels) &mdash; &Eacute;tats-Unis</li>
            <li>
              Supabase (h&eacute;bergement de base de donn&eacute;es) &mdash; Europe / Singapour
            </li>
            <li>Vercel (h&eacute;bergement du site) &mdash; &Eacute;tats-Unis</li>
          </ul>
          <p>
            Ces prestataires agissent en qualit&eacute; de sous-traitants au sens du
            RGPD et sont tenus &agrave; la confidentialit&eacute;.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Dur&eacute;e de conservation
        </h2>
        <p className="text-text-body leading-relaxed">
          Les donn&eacute;es de commande sont conserv&eacute;es pendant 10 ans conform&eacute;ment aux
          obligations comptables. Les donn&eacute;es des demandes de devis non
          concr&eacute;tis&eacute;es sont supprim&eacute;es apr&egrave;s 3 ans. Les donn&eacute;es de compte client
          restent actives tant que le compte existe ; elles sont supprim&eacute;es sur
          demande.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">
          Vos droits
        </h2>
        <div className="text-text-body leading-relaxed space-y-3">
          <p>
            Conform&eacute;ment au RGPD, vous disposez des droits suivants sur vos
            donn&eacute;es :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Droit d&rsquo;acc&egrave;s</li>
            <li>Droit de rectification</li>
            <li>Droit &agrave; l&rsquo;effacement (&laquo;&nbsp;droit &agrave; l&rsquo;oubli&nbsp;&raquo;)</li>
            <li>Droit &agrave; la limitation du traitement</li>
            <li>Droit &agrave; la portabilit&eacute;</li>
            <li>Droit d&rsquo;opposition</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez contact@chezmisou.com. Vous avez
            &eacute;galement le droit d&rsquo;introduire une r&eacute;clamation aupr&egrave;s de la CNIL
            (www.cnil.fr).
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-serif text-marron mt-8 mb-4">Cookies</h2>
        <p className="text-text-body leading-relaxed">
          Ce site utilise uniquement des cookies techniques essentiels au
          fonctionnement (panier, session admin). Aucun cookie publicitaire ni de
          tra&ccedil;age tiers n&rsquo;est d&eacute;ploy&eacute;. Vous pouvez bloquer les cookies via les
          param&egrave;tres de votre navigateur, mais certaines fonctionnalit&eacute;s du site
          risquent de ne plus fonctionner.
        </p>
      </section>

      <p className="text-text-body mt-12 text-sm italic">
        Derni&egrave;re mise &agrave; jour : 8 avril 2026.
      </p>
    </main>
  );
}
