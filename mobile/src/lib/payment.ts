import * as WebBrowser from "expo-web-browser";
import { api } from "./api";

export type CardPaymentResult =
  | { status: "paid"; orderNumber?: string }
  | { status: "unpaid" };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Ouvre le paiement sécurisé Stripe dans le navigateur intégré, puis vérifie
 * auprès du site si le paiement a abouti (la commande est créée par Stripe).
 */
export async function payWithCard(url: string, sessionId?: string): Promise<CardPaymentResult> {
  await WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    dismissButtonStyle: "close",
  });
  if (!sessionId) return { status: "unpaid" };

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await api<{ status: "paid" | "processing" | "unpaid"; orderNumber?: string }>(
        `/api/mobile/checkout-status?session_id=${encodeURIComponent(sessionId)}`,
        { auth: false }
      );
      if (r.status === "paid") return { status: "paid", orderNumber: r.orderNumber };
      if (r.status === "unpaid") return { status: "unpaid" };
      // « processing » : payé, la commande se crée. On patiente un peu.
    } catch {
      // réseau : on réessaie
    }
    await wait(1500);
  }
  return { status: "paid" };
}

/** Lit le numéro de commande dans l'URL renvoyée pour un paiement en espèces. */
export function orderNumberFromUrl(url: string): string | undefined {
  const m = url.match(/[?&]order=([^&]+)/);
  return m ? decodeURIComponent(m[1]) : undefined;
}
