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

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderConfirmationLacProps {
  firstName: string;
  orderNumber: string;
  serviceDate: string;
  deliveryMethod: "pickup" | "local_delivery";
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  address?: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
  };
  deliveryInstructions?: string;
  appUrl: string;
}

export function OrderConfirmationLac({
  firstName,
  orderNumber,
  serviceDate,
  deliveryMethod,
  items,
  subtotal,
  shippingCost,
  total,
  address,
  deliveryInstructions,
  appUrl,
}: OrderConfirmationLacProps) {
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
            <Text style={title}>
              Merci pour votre commande, {firstName} !
            </Text>
            <Text style={paragraph}>
              Votre commande pour le <strong>{serviceDate}</strong> est bien
              enregistrée. Misou cuisine avec amour.
            </Text>
            <Text style={orderRef}>
              Commande N° <strong>{orderNumber}</strong>
            </Text>

            <Hr style={divider} />

            {deliveryMethod === "pickup" ? (
              <>
                <Text style={sectionTitle}>Retrait sur place</Text>
                <Text style={paragraph}>
                  Vous viendrez chercher votre commande dimanche matin.
                  Vous recevrez un second email avec les détails
                  dans les prochaines heures.
                </Text>
              </>
            ) : (
              <>
                <Text style={sectionTitle}>Livraison à domicile</Text>
                <Text style={paragraph}>
                  Votre commande sera livrée dimanche matin &agrave; l&rsquo;adresse
                  suivante :
                </Text>
                {address && (
                  <Text style={addressBlock}>
                    {address.line1}
                    {address.line2 ? (
                      <>
                        <br />
                        {address.line2}
                      </>
                    ) : null}
                    <br />
                    {address.postalCode} {address.city}
                  </Text>
                )}
                {deliveryInstructions && (
                  <Text style={paragraph}>
                    <em>Instructions : {deliveryInstructions}</em>
                  </Text>
                )}
              </>
            )}

            <Hr style={divider} />

            <Text style={sectionTitle}>Vos plats</Text>
            <table style={table} cellPadding="0" cellSpacing="0">
              <thead>
                <tr>
                  <th style={thLeft}>Plat</th>
                  <th style={thCenter}>Qté</th>
                  <th style={thRight}>Prix</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={tdLeft}>{item.name}</td>
                    <td style={tdCenter}>{item.quantity}</td>
                    <td style={tdRight}>{item.total.toFixed(2)}&nbsp;€</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Hr style={divider} />

            <table style={totalsTable} cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={totalLabel}>Sous-total</td>
                  <td style={totalValue}>{subtotal.toFixed(2)}&nbsp;€</td>
                </tr>
                <tr>
                  <td style={totalLabel}>Livraison</td>
                  <td style={totalValue}>
                    {shippingCost === 0
                      ? "Gratuit"
                      : `${shippingCost.toFixed(2)} €`}
                  </td>
                </tr>
                <tr>
                  <td style={totalLabelBold}>Total</td>
                  <td style={totalValueBold}>
                    {total.toFixed(2)}&nbsp;€
                  </td>
                </tr>
              </tbody>
            </table>
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

const title = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#3B2314",
  marginBottom: "8px",
};

const orderRef = {
  fontSize: "14px",
  color: "#9B8B7A",
  marginTop: "4px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#4A3728",
};

const addressBlock = {
  fontSize: "15px",
  lineHeight: "1.6",
  color: "#4A3728",
  backgroundColor: "#FFF8EE",
  padding: "12px 16px",
  borderRadius: "6px",
  border: "1px solid #E8DFD5",
};

const sectionTitle = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#3B2314",
  marginBottom: "12px",
};

const divider = {
  borderColor: "#E8DFD5",
  margin: "20px 0",
};

const table: React.CSSProperties = {
  width: "100%",
  fontSize: "14px",
  color: "#4A3728",
};

const thLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 0",
  borderBottom: "1px solid #E8DFD5",
  fontWeight: 600,
  color: "#3B2314",
};

const thCenter: React.CSSProperties = {
  textAlign: "center",
  padding: "8px 0",
  borderBottom: "1px solid #E8DFD5",
  fontWeight: 600,
  color: "#3B2314",
};

const thRight: React.CSSProperties = {
  textAlign: "right",
  padding: "8px 0",
  borderBottom: "1px solid #E8DFD5",
  fontWeight: 600,
  color: "#3B2314",
};

const tdLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 0",
  borderBottom: "1px solid #F0EBE4",
};

const tdCenter: React.CSSProperties = {
  textAlign: "center",
  padding: "8px 0",
  borderBottom: "1px solid #F0EBE4",
};

const tdRight: React.CSSProperties = {
  textAlign: "right",
  padding: "8px 0",
  borderBottom: "1px solid #F0EBE4",
};

const totalsTable: React.CSSProperties = {
  width: "100%",
  fontSize: "14px",
  color: "#4A3728",
};

const totalLabel: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 0",
};

const totalValue: React.CSSProperties = {
  textAlign: "right",
  padding: "4px 0",
};

const totalLabelBold: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 0 4px",
  fontWeight: "bold",
  fontSize: "16px",
  color: "#D4762C",
};

const totalValueBold: React.CSSProperties = {
  textAlign: "right",
  padding: "8px 0 4px",
  fontWeight: "bold",
  fontSize: "16px",
  color: "#D4762C",
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
