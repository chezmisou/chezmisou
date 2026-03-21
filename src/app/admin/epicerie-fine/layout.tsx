"use client";

import SessionProvider from "@/components/providers/SessionProvider";
import { Toaster } from "react-hot-toast";

export default function EpicerieAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" />
    </SessionProvider>
  );
}
