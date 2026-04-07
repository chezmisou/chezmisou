import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { OrderStatus } from "@prisma/client";
import { resend, RESEND_FROM } from "@/lib/resend";
import { render } from "@react-email/render";
import {
  OrderStatusUpdate,
  statusMessages,
} from "@/lib/emails/order-status-update";

const validStatuses = Object.values(OrderStatus);

const emailStatuses: OrderStatus[] = [
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const { status } = await req.json();

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: status as OrderStatus,
      },
      include: {
        customer: true,
        items: true,
      },
    });

    // Send email notification if applicable
    let emailSent = false;
    let emailError: string | undefined;

    if (emailStatuses.includes(status as OrderStatus)) {
      const recipientEmail = order.guestEmail || order.customer?.email;

      if (recipientEmail) {
        try {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://chezmisou.com";

          const formatEur = (value: unknown) =>
            new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(Number(value) || 0);

          const html = await render(
            OrderStatusUpdate({
              status: status as OrderStatus,
              orderNumber: order.orderNumber,
              total: formatEur(order.total),
              items: order.items.map((item) => ({
                name: item.itemNameSnapshot,
                quantity: item.quantity,
              })),
              appUrl,
            })
          );

          const msg = statusMessages[status as OrderStatus];

          await resend.emails.send({
            from: RESEND_FROM,
            to: recipientEmail,
            subject: `Chez Misou — ${msg.subject}`,
            html,
          });

          emailSent = true;
          console.log(
            `[status-update] Email sent to ${recipientEmail} for status "${status}"`
          );
        } catch (err) {
          emailError =
            err instanceof Error ? err.message : "Erreur inconnue";
          console.error("[status-update] Failed to send email:", err);
        }
      } else {
        emailError = "Aucune adresse email trouvée pour ce client";
        console.warn(
          `[status-update] No email found for order ${order.orderNumber}`
        );
      }
    }

    return NextResponse.json({ success: true, emailSent, emailError });
  } catch (err) {
    console.error("Error updating order status:", err);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
