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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://chez-misou.vercel.app",
  ),
  title: {
    default: "Chez Misou — Manje Lakay",
    template: "%s · Chez Misou",
  },
  description:
    "Le goût authentique d’Haïti, comme à la maison. Épicerie fine, traiteur et Lunch After Church par Misou.",
  keywords: [
    "cuisine haïtienne",
    "traiteur haïtien Paris",
    "épicerie haïtienne",
    "krémas",
    "griot",
    "pikliz",
    "Manje Lakay",
  ],
  authors: [{ name: "Chez Misou" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Chez Misou — Manje Lakay",
    images: [
      {
        url: "/logo-chez-misou.png",
        width: 1024,
        height: 1024,
        alt: "Chez Misou — Manje Lakay",
      },
    ],
  },
  icons: {
    icon: "/logo-chez-misou.png",
    apple: "/logo-chez-misou.png",
  },
  robots: {
    index: true,
    follow: true,
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
