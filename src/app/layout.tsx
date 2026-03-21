import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Lunch After Church — Bon manje, bon konpayi",
  description:
    "Commandez votre repas du dimanche. Banan Peze, Riz Djondjon, Poulet frit et plus encore!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
