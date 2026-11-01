const priceFormatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

export function formatPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatDate(iso: string, withWeekday = true): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    ...(withWeekday ? { weekday: "long" as const } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }) +
    " à " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  new: "Nouvelle",
  paid: "Payée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  quote_sent: "Devis envoyé",
  accepted: "Accepté",
  refused: "Refusé",
};
