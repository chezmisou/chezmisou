import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import BottomNav from "@/components/ui/BottomNav";
import { CartProvider } from "@/lib/cart/CartContext";

export const metadata: Metadata = {
  title: "Chez Misou — Lakay ou, nan chak bouch",
  description:
    "Saveurs authentiques d'Haïti. Traiteur, Lunch After Church, Épicerie Fine — préparées avec amour.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
