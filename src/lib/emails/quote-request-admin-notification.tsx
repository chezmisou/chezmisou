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

interface DishSnapshot {
  dishName: string;
  category: string | null;
  matchedFormat: {
    minPeople: number;
    maxPeople: number;
    pricePerPerson: number;
  } | null;
  estimatedTotal: number | null;
}

interface QuoteRequestAdminNotificationProps {
  quoteNumber: string;
  quoteId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventType: string | null;
  nbPeople: number;
  eventLocation: string | null;
  dishes: DishSnapshot[];
  message: string | null;
  appUrl: string;
}

export function QuoteRequestAdminNotification({
  quoteNumber,
  quoteId,
  customerName,
  customerEmail,
  customerPhone,
  eventDate,
  eventType,
  nbPeople,
  eventLocation,
  dishes,
  message,
  appUrl,
}: QuoteRequestAdminNotificationProps) {
  const totalEstimation = dishes.reduce(
    (sum, d) => sum + (d.estimatedTotal ?? 0),
    0
  );

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>Nouvelle demande de devis traiteur</Text>

            <Text style={paragraph}>
              <strong>N° :</strong> {quoteNumber}
              <br />
              <strong>Date de réception :</strong>{" "}
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Client</Text>
            <Text style={paragraph}>
              <strong>{customerName}</strong>
              <br />
              <Link href={`mailto:${customerEmail}`} style={link}>
                {customerEmail}
              </Link>
              <br />
              <Link href={`tel:${customerPhone}`} style={link}>
                {customerPhone}
              </Link>
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Événement</Text>
            <Text style={paragraph}>
              <strong>Date :</strong> {eventDate}
              <br />
              <strong>Nombre de personnes :</strong> {nbPeople}
              {eventType && (
                <>
                  <br />
                  <strong>Type :</strong> {eventType}
                </>
              )}
              {eventLocation && (
                <>
                  <br />
                  <strong>Lieu :</strong> {eventLocation}
                </>
              )}
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Plats sélectionnés</Text>
            {dishes.map((dish, i) => (
              <Text key={i} style={dishLine}>
                • <strong>{dish.dishName}</strong>
                {dish.category ? ` (${dish.category})` : ""}
                {dish.matchedFormat
                  ? ` — ${dish.matchedFormat.pricePerPerson.toFixed(2)} €/pers × ${nbPeople} = ${dish.estimatedTotal?.toFixed(2)} €`
                  : " — format sur mesure"}
              </Text>
            ))}

            {totalEstimation > 0 && (
              <Text style={totalLine}>
                Estimation totale : {totalEstimation.toFixed(2)} €
              </Text>
            )}

            {message && (
              <>
                <Hr style={divider} />
                <Text style={sectionTitle}>Message du client</Text>
                <Text style={paragraph}>{message}</Text>
              </>
            )}

            <Hr style={divider} />

            <Link
              href={`${appUrl}/admin/devis/${quoteId}`}
              style={button}
            >
              Ouvrir dans l&apos;admin
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
  margin: "0 0 16px",
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
  lineHeight: "1.6",
  color: "#4A3728",
};

const dishLine = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#4A3728",
  margin: "2px 0",
};

const totalLine = {
  fontSize: "16px",
  fontWeight: "bold" as const,
  color: "#D4762C",
  marginTop: "12px",
};

const link = {
  color: "#D4762C",
  textDecoration: "underline",
};

const divider = {
  borderColor: "#E8DFD5",
  margin: "16px 0",
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
