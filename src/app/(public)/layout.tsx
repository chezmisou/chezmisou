import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { LacCartProvider } from "@/lib/cart/LacCartContext";
import { TraiteurSelectionProvider } from "@/lib/traiteur/TraiteurSelectionContext";
import CartDrawer from "@/components/public/CartDrawer";
import LacCartDrawer from "@/components/public/LacCartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <LacCartProvider>
        <TraiteurSelectionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <LacCartDrawer />
        </TraiteurSelectionProvider>
      </LacCartProvider>
    </CartProvider>
  );
}
