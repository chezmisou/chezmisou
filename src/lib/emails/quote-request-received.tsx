import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import * as React from "react";

interface DishInfo {
  name: string;
  pricePerPerson: number | null;
}

interface QuoteRequestReceivedProps {
  customerName: string;
  quoteNumber: string;
  eventDate: string;
  nbPeople: number;
  dishes: DishInfo[];
}

export function QuoteRequestReceived({
  customerName,
  quoteNumber,
  eventDate,
  nbPeople,
  dishes,
}: QuoteRequestReceivedProps) {
  const firstName = customerName.split(" ")[0];

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={logo}>Chez Misou</Text>

            <Text style={title}>
              Votre demande est bien reçue, {firstName}
            </Text>

            <Text style={paragraph}>
              Merci de votre intérêt pour notre service traiteur. Votre demande
              n° <strong>{quoteNumber}</strong> est entre les mains de Misou.
            </Text>

            <Text style={paragraph}>
              Vous serez recontacté(e) sous 48h au numéro que vous nous avez
              communiqué.
            </Text>

            <Hr style={divider} />

            <Text style={sectionTitle}>Récapitulatif de votre demande</Text>

            <Text style={paragraph}>
              <strong>Date de l&apos;événement :</strong> {eventDate}
              <br />
              <strong>Nombre de personnes :</strong> {nbPeople}
            </Text>

            <Text style={sectionTitle}>Plats sélectionnés</Text>

            {dishes.map((dish, i) => (
              <Text key={i} style={dishLine}>
                • {dish.name}
                {dish.pricePerPerson !== null
                  ? ` — ${dish.pricePerPerson.toFixed(2)} €/pers`
                  : " — devis sur mesure"}
              </Text>
            ))}

            <Hr style={divider} />

            <Text style={footer}>
              À très bientôt,
              <br />
              Misou &amp; toute l&apos;équipe Chez Misou
            </Text>
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

const logo = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#D4762C",
  textAlign: "center" as const,
  marginBottom: "24px",
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

const divider = {
  borderColor: "#E8DFD5",
  margin: "16px 0",
};

const footer = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#4A3728",
  marginTop: "16px",
};
