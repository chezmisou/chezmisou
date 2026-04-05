import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Chez Misou \u2014 Manje Lakay",
    template: "%s \u00b7 Chez Misou",
  },
  description:
    "Le go\u00fbt authentique d\u2019Ha\u00efti, comme \u00e0 la maison. \u00c9picerie fine, traiteur et Lunch After Church par Misou.",
  openGraph: {
    title: "Chez Misou \u2014 Manje Lakay",
    description:
      "Le go\u00fbt authentique d\u2019Ha\u00efti, comme \u00e0 la maison. \u00c9picerie fine, traiteur et Lunch After Church par Misou.",
    images: ["/logo-chez-misou.png"],
  },
  icons: {
    icon: "/logo-chez-misou.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
