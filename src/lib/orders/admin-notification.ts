import { render } from "@react-email/render";
import { resend, RESEND_FROM } from "@/lib/resend";
import { AdminNewOrder } from "@/lib/emails/admin-new-order";

export async function sendAdminNotification({
  orderNumber,
  orderId,
  orderLabel,
  customerName,
  customerEmail,
  emailItems,
  subtotalEuros,
  shippingEuros,
  totalEuros,
  address,
  pickupLocation,
  paymentNote,
  subject,
}: {
  orderNumber: string;
  orderId: string;
  orderLabel?: string;
  customerName: string;
  customerEmail: string;
  emailItems: { name: string; quantity: number; total: number }[];
  subtotalEuros: number;
  shippingEuros: number;
  totalEuros: number;
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  pickupLocation?: string;
  paymentNote?: string;
  subject: string;
}) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!adminEmails?.length) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://chezmisou.com";

  try {
    const adminHtml = await render(
      AdminNewOrder({
        orderNumber,
        orderId,
        orderLabel,
        customerName,
        customerEmail,
        items: emailItems,
        subtotal: subtotalEuros,
        shippingCost: shippingEuros,
        total: totalEuros,
        address,
        pickupLocation,
        paymentNote,
        appUrl,
      })
    );

    await resend.emails.send({
      from: RESEND_FROM,
      to: adminEmails,
      subject,
      html: adminHtml,
    });
    console.log("[admin-notification] Sent to:", adminEmails);
  } catch (err) {
    console.error("[admin-notification] Failed to send admin email:", err);
  }
}
