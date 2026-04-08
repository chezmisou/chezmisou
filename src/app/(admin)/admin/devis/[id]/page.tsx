import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import QuoteStatusUpdater from "@/components/admin/QuoteStatusUpdater";
import AdminNotes from "@/components/admin/AdminNotes";

const statusLabels: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En cours", className: "bg-orange-100 text-orange-700" },
  quote_sent: { label: "Devis envoyé", className: "bg-purple-100 text-purple-700" },
  accepted: { label: "Acceptée", className: "bg-green-100 text-green-700" },
  refused: { label: "Refusée", className: "bg-gris-chaud/20 text-gris-chaud" },
};

interface DishSnapshot {
  dishId: string;
  dishName: string;
  category: string | null;
  matchedFormat: {
    minPeople: number;
    maxPeople: number;
    pricePerPerson: number;
  } | null;
  estimatedTotal: number | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export default async function AdminDevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quoteRequest.findUnique({ where: { id } });

  if (!quote) {
    notFound();
  }

  const status = statusLabels[quote.status] || statusLabels.new;
  const dishes = (quote.selectedDishes as unknown as DishSnapshot[]) || [];
  const totalEstimation = dishes.reduce(
    (sum, d) => sum + (d.estimatedTotal ?? 0),
    0
  );

  const mailtoSubject = encodeURIComponent(
    `Re: Votre demande de devis #${quote.quoteNumber}`
  );
  const mailtoHref = `mailto:${quote.guestEmail}?subject=${mailtoSubject}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/devis"
          className="inline-flex items-center gap-1 text-sm text-gris-chaud hover:text-orange transition-colors mb-2"
        >
          <ArrowLeft size={16} />
          Retour aux demandes
        </Link>
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="font-serif text-3xl font-bold text-marron-profond">
            Devis #{quote.quoteNumber}
          </h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <p className="text-text-body mt-1">
          Reçu le{" "}
          {format(quote.createdAt, "EEEE d MMMM yyyy 'à' HH:mm", {
            locale: fr,
          })}
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <a
          href={mailtoHref}
          className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors text-sm"
        >
          <Mail size={16} />
          Répondre par email
        </a>
        {quote.guestPhone && (
          <a
            href={`tel:${quote.guestPhone}`}
            className="inline-flex items-center gap-2 border border-marron-doux/30 text-marron-profond px-5 py-2.5 rounded-xl font-semibold hover:border-orange transition-colors text-sm"
          >
            <Phone size={16} />
            Appeler
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
            Client
          </h2>
          <div className="space-y-2 text-sm">
            <p className="font-medium text-marron-profond">{quote.guestName}</p>
            <p>
              <a
                href={`mailto:${quote.guestEmail}`}
                className="text-orange hover:underline"
              >
                {quote.guestEmail}
              </a>
            </p>
            {quote.guestPhone && (
              <p>
                <a
                  href={`tel:${quote.guestPhone}`}
                  className="text-orange hover:underline"
                >
                  {quote.guestPhone}
                </a>
              </p>
            )}
          </div>
        </div>

        {/* Événement */}
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
            Événement
          </h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gris-chaud">Date :</span>{" "}
              <span className="text-marron-profond font-medium capitalize">
                {format(quote.eventDate, "EEEE d MMMM yyyy", { locale: fr })}
              </span>
            </p>
            <p>
              <span className="text-gris-chaud">Nombre de personnes :</span>{" "}
              <span className="text-marron-profond font-medium">
                {quote.nbPeople}
              </span>
            </p>
            {quote.eventType && (
              <p>
                <span className="text-gris-chaud">Type :</span>{" "}
                <span className="text-marron-profond">{quote.eventType}</span>
              </p>
            )}
            {quote.eventLocation && (
              <p>
                <span className="text-gris-chaud">Lieu :</span>{" "}
                <span className="text-marron-profond">
                  {quote.eventLocation}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Plats sélectionnés */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
          Plats sélectionnés
        </h2>
        {dishes.length > 0 ? (
          <div className="space-y-3">
            {dishes.map((dish, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-marron-doux/10 last:border-0"
              >
                <div>
                  <span className="font-medium text-marron-profond">
                    {dish.dishName}
                  </span>
                  {dish.category && (
                    <span className="text-xs text-gris-chaud ml-2">
                      ({dish.category})
                    </span>
                  )}
                </div>
                <div className="text-right text-sm">
                  {dish.matchedFormat ? (
                    <>
                      <span className="text-text-body">
                        {dish.matchedFormat.pricePerPerson.toFixed(2)} €/pers
                      </span>
                      <span className="text-marron-profond font-semibold ml-3">
                        {formatCurrency(dish.estimatedTotal ?? 0)}
                      </span>
                    </>
                  ) : (
                    <span className="text-gris-chaud italic">
                      Format sur mesure
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gris-chaud">Aucun plat sélectionné</p>
        )}
      </div>

      {/* Estimation */}
      {totalEstimation > 0 && (
        <div className="bg-orange/5 rounded-2xl p-6 border border-orange/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-2">
            Estimation indicative
          </h2>
          <p className="text-3xl font-serif font-bold text-orange">
            {formatCurrency(totalEstimation)}
          </p>
          <p className="text-sm text-text-body mt-1">
            Basé sur {quote.nbPeople} personnes · prix indicatifs
          </p>
        </div>
      )}

      {/* Message du client */}
      {quote.message && (
        <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
          <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
            Message du client
          </h2>
          <p className="text-text-body whitespace-pre-wrap">{quote.message}</p>
        </div>
      )}

      {/* Notes internes */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
          Notes internes
        </h2>
        <AdminNotes quoteId={quote.id} initialNotes={quote.adminNotes || ""} />
      </div>

      {/* Changer le statut */}
      <div className="bg-blanc rounded-2xl p-6 shadow-sm border border-marron-doux/20">
        <h2 className="font-serif text-lg font-bold text-marron-profond mb-4">
          Changer le statut
        </h2>
        <QuoteStatusUpdater quoteId={quote.id} currentStatus={quote.status} />
      </div>
    </div>
  );
}
