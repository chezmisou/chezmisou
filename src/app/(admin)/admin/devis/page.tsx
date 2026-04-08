import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye } from "lucide-react";

const statusLabels: Record<string, { label: string; className: string }> = {
  new: { label: "Nouvelle", className: "bg-blue-100 text-blue-700" },
  in_progress: { label: "En cours", className: "bg-orange-100 text-orange-700" },
  quote_sent: { label: "Devis envoyé", className: "bg-purple-100 text-purple-700" },
  accepted: { label: "Acceptée", className: "bg-green-100 text-green-700" },
  refused: { label: "Refusée", className: "bg-gris-chaud/20 text-gris-chaud" },
};

const statusFilters = [
  { value: "all", label: "Toutes" },
  { value: "new", label: "Nouvelles" },
  { value: "in_progress", label: "En cours" },
  { value: "quote_sent", label: "Devis envoyé" },
  { value: "accepted", label: "Acceptées" },
  { value: "refused", label: "Refusées" },
];

export default async function AdminDevisPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  const where =
    filterStatus && filterStatus !== "all"
      ? { status: filterStatus as "new" | "in_progress" | "quote_sent" | "accepted" | "refused" }
      : {};

  const [quotes, newCount] = await Promise.all([
    prisma.quoteRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.quoteRequest.count({ where: { status: "new" } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Demandes de devis
        </h1>
        {newCount > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {newCount} nouvelle{newCount > 1 ? "s" : ""} demande{newCount > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((sf) => {
          const isActive =
            filterStatus === sf.value || (!filterStatus && sf.value === "all");
          return (
            <Link
              key={sf.value}
              href={
                sf.value === "all"
                  ? "/admin/devis"
                  : `/admin/devis?status=${sf.value}`
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-orange text-blanc"
                  : "bg-blanc border border-marron-doux/20 text-text-body hover:border-orange"
              }`}
            >
              {sf.label}
            </Link>
          );
        })}
      </div>

      {quotes.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="text-gris-chaud">Aucune demande pour le moment.</p>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    N° devis
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Réception
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Événement
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Personnes
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Type
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => {
                  const status = statusLabels[quote.status] || statusLabels.new;
                  return (
                    <tr
                      key={quote.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/devis/${quote.id}`}
                          className="text-orange hover:underline font-mono text-xs"
                        >
                          {quote.quoteNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {format(quote.createdAt, "dd/MM/yyyy HH:mm", {
                          locale: fr,
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-marron-profond font-medium">
                          {quote.guestName}
                        </div>
                        <div className="text-xs text-gris-chaud">
                          {quote.guestEmail}
                          {quote.guestPhone && ` · ${quote.guestPhone}`}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {format(quote.eventDate, "dd/MM/yyyy", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-center text-marron-profond font-medium">
                        {quote.nbPeople}
                      </td>
                      <td className="py-3 px-4 text-text-body">
                        {quote.eventType || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/devis/${quote.id}`}
                          className="inline-flex items-center gap-1 text-sm text-orange hover:text-orange-vif transition-colors"
                        >
                          <Eye size={16} />
                          Voir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
