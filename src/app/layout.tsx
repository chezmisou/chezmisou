import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const playfair = localFont({
  src: [
    {
      path: "../fonts/playfair-display-latin-wght-normal.woff2",
      style: "normal",
    },
    {
      path: "../fonts/playfair-display-latin-wght-italic.woff2",
      style: "italic",
    },
  ],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = localFont({
  src: "../fonts/dm-sans-latin-wght-normal.woff2",
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chez Misou — Manje Lakay",
    template: "%s · Chez Misou",
  },
  description:
    "Le goût authentique d’Haïti, comme à la maison. Épicerie fine, traiteur et Lunch After Church par Misou.",
  openGraph: {
    title: "Chez Misou — Manje Lakay",
    description:
      "Le goût authentique d’Haïti, comme à la maison. Épicerie fine, traiteur et Lunch After Church par Misou.",
    images: ["/logo-chez-misou.png"],
  },
  icons: {
    icon: "/logo-chez-misou.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">{children}</body>
    </html>
  );
}
