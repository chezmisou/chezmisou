import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import BottomNav from "@/components/ui/BottomNav";

export const metadata: Metadata = {
  title: "Chez Misou — Lakay ou, nan chak bouch",
  description:
    "Commandez en ligne des plats et produits haïtiens authentiques. Service traiteur et Lunch After Church chaque dimanche.",
  keywords: ["haïtien", "traiteur", "commande en ligne", "griyo", "diri djon djon", "créole"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
