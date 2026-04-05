import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { CartProvider } from "@/lib/cart/CartContext";
import CartDrawer from "@/components/public/CartDrawer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
