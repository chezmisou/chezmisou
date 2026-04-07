import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

type OrderStatus =
  | "new"
  | "paid"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const statusMessages: Record<
  OrderStatus,
  { subject: string; title: string; body: string }
> = {
  new: {
    subject: "",
    title: "",
    body: "",
  },
  paid: {
    subject: "Votre paiement est confirmé",
    title: "Paiement confirmé 🎉",
    body: "Nous avons bien reçu votre paiement. Misou va bientôt préparer votre colis avec amour.",
  },
  preparing: {
    subject: "Votre commande est en préparation",
    title: "On s'active en cuisine 👩‍🍳",
    body: "Misou prépare votre commande en ce moment même. Vous recevrez un nouveau message dès qu'elle sera expédiée.",
  },
  shipped: {
    subject: "Votre commande est en route",
    title: "C'est parti 🚚",
    body: "Votre commande vient d'être expédiée. Elle devrait arriver sous 3 à 5 jours ouvrés.",
  },
  delivered: {
    subject: "Votre commande a été livrée",
    title: "Bon appétit 🍴",
    body: "Votre colis est arrivé à destination. Nous espérons que vous vous régalerez. N'hésitez pas à partager votre expérience avec nous !",
  },
  cancelled: {
    subject: "Votre commande a été annulée",
    title: "Commande annulée",
    body: "Votre commande a été annulée. Si vous avez une question, contactez-nous à contact@chezmisou.com.",
  },
  refunded: {
    subject: "Votre commande a été remboursée",
    title: "Remboursement effectué",
    body: "Votre commande a été remboursée. Le montant sera crédité sur votre moyen de paiement sous quelques jours.",
  },
};

export { statusMessages };

interface OrderItemSummary {
  name: string;
  quantity: number;
}

interface OrderStatusUpdateProps {
  status: OrderStatus;
  orderNumber: string;
  total: string;
  items: OrderItemSummary[];
  appUrl: string;
}

export function OrderStatusUpdate({
  status,
  orderNumber,
  total,
  items,
  appUrl,
}: OrderStatusUpdateProps) {
  const msg = statusMessages[status] || statusMessages.paid;
  const displayItems = items.slice(0, 3);
  const remaining = items.length - displayItems.length;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${appUrl}/logo-chez-misou.png`}
              width="120"
              alt="Chez Misou"
              style={{ margin: "0 auto" }}
            />
          </Section>

          <Section style={content}>
            <Text style={title}>{msg.title}</Text>
            <Text style={paragraph}>{msg.body}</Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Votre commande</Text>
            <Text style={orderInfo}>
              N° <strong>{orderNumber}</strong> — Total :{" "}
              <strong>{total}</strong>
            </Text>

            {displayItems.map((item, i) => (
              <Text key={i} style={itemLine}>
                • {item.name} × {item.quantity}
              </Text>
            ))}
            {remaining > 0 && (
              <Text style={itemLineMore}>
                … et {remaining} autre{remaining > 1 ? "s" : ""} article
                {remaining > 1 ? "s" : ""}
              </Text>
            )}

            <Hr style={divider} />

            <Text style={signature}>Avec toute notre gratitude,</Text>
            <Text style={signatureName}>Misou</Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              Manje lakay, partout où vous êtes.
            </Text>
            <Link href="mailto:contact@chezmisou.com" style={footerLink}>
              contact@chezmisou.com
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#FFF8EE",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "580px",
};

const header = {
  backgroundColor: "#3B2314",
  padding: "24px 0",
  textAlign: "center" as const,
  borderRadius: "8px 8px 0 0",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "32px 24px",
};

const title: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#3B2314",
  fontFamily: "'Playfair Display', Georgia, serif",
  marginBottom: "8px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#4A3728",
  fontFamily: "'DM Sans', Arial, Helvetica, sans-serif",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#3B2314",
  marginBottom: "8px",
};

const orderInfo = {
  fontSize: "15px",
  color: "#4A3728",
  marginBottom: "12px",
};

const itemLine = {
  fontSize: "14px",
  color: "#4A3728",
  margin: "2px 0",
  paddingLeft: "4px",
};

const itemLineMore = {
  fontSize: "13px",
  color: "#8B7355",
  fontStyle: "italic" as const,
  margin: "4px 0 0",
  paddingLeft: "4px",
};

const divider = {
  borderColor: "#E8DFD5",
  margin: "20px 0",
};

const signature = {
  fontSize: "15px",
  color: "#4A3728",
  marginBottom: "0",
  fontStyle: "italic" as const,
};

const signatureName = {
  fontSize: "18px",
  fontWeight: "bold" as const,
  color: "#D4762C",
  fontFamily: "'Playfair Display', Georgia, serif",
  marginTop: "4px",
};

const footer = {
  backgroundColor: "#3B2314",
  padding: "20px 24px",
  textAlign: "center" as const,
  borderRadius: "0 0 8px 8px",
};

const footerText = {
  color: "#E8B84B",
  fontSize: "14px",
  fontStyle: "italic" as const,
  margin: "0 0 8px",
};

const footerLink = {
  color: "#D4762C",
  fontSize: "13px",
};
