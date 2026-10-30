import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import { LacCartProvider } from "@/lib/cart/LacCartContext";
import { TraiteurSelectionProvider } from "@/lib/traiteur/TraiteurSelectionContext";
import CartDrawer from "@/components/public/CartDrawer";
import LacCartDrawer from "@/components/public/LacCartDrawer";
import { isTraiteurEnabled } from "@/lib/settings";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const traiteurEnabled = await isTraiteurEnabled();

  return (
    <CartProvider>
      <LacCartProvider>
        <TraiteurSelectionProvider>
          <Navbar traiteurEnabled={traiteurEnabled} />
          <main className="flex-1">{children}</main>
          <Footer traiteurEnabled={traiteurEnabled} />
          <CartDrawer />
          <LacCartDrawer />
        </TraiteurSelectionProvider>
      </LacCartProvider>
    </CartProvider>
  );
}
