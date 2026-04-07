import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  quantity: number;
  total: number;
}

interface AdminNewOrderProps {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  address: {
    line1: string;
    line2?: string;
    postalCode: string;
    city: string;
    country: string;
  };
  appUrl: string;
}

export function AdminNewOrder({
  orderNumber,
  orderId,
  customerName,
  customerEmail,
  items,
  subtotal,
  shippingCost,
  total,
  address,
  appUrl,
}: AdminNewOrderProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>
              Nouvelle commande épicerie : #{orderNumber}
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Client</Text>
            <Text style={paragraph}>
              {customerName}
              <br />
              {customerEmail}
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Articles</Text>
            <table style={table} cellPadding="0" cellSpacing="0">
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={tdLeft}>
                      {item.quantity}× {item.name}
                    </td>
                    <td style={tdRight}>
                      {item.total.toFixed(2)}&nbsp;€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Hr style={divider} />

            <table style={table} cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={tdLeft}>Sous-total</td>
                  <td style={tdRight}>{subtotal.toFixed(2)}&nbsp;€</td>
                </tr>
                <tr>
                  <td style={tdLeft}>Frais de port</td>
                  <td style={tdRight}>
                    {shippingCost === 0
                      ? "Offerts"
                      : `${shippingCost.toFixed(2)} €`}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      ...tdLeft,
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      ...tdRight,
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#D4762C",
                    }}
                  >
                    {total.toFixed(2)}&nbsp;€
                  </td>
                </tr>
              </tbody>
            </table>

            <Hr style={divider} />

            <Text style={sectionTitle}>Adresse de livraison</Text>
            <Text style={paragraph}>
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.postalCode} {address.city}, {address.country}
            </Text>

            <Hr style={divider} />

            <Link
              href={`${appUrl}/admin/commandes/${orderId}`}
              style={button}
            >
              Voir la commande
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f4f5",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const container = {
  margin: "0 auto",
  maxWidth: "540px",
  padding: "20px 0",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "28px 24px",
  borderRadius: "8px",
  border: "1px solid #e4e4e7",
};

const title = {
  fontSize: "20px",
  fontWeight: "bold" as const,
  color: "#3B2314",
  margin: "0 0 4px",
};

const sectionTitle = {
  fontSize: "14px",
  fontWeight: "bold" as const,
  color: "#3B2314",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  marginBottom: "8px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#4A3728",
};

const divider = {
  borderColor: "#E8DFD5",
  margin: "16px 0",
};

const table: React.CSSProperties = {
  width: "100%",
  fontSize: "14px",
  color: "#4A3728",
};

const tdLeft: React.CSSProperties = {
  textAlign: "left",
  padding: "4px 0",
};

const tdRight: React.CSSProperties = {
  textAlign: "right",
  padding: "4px 0",
};

const button = {
  display: "inline-block",
  backgroundColor: "#D4762C",
  color: "#ffffff",
  padding: "10px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "bold" as const,
  textDecoration: "none",
};
