import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "sonner";

export const metadata = {
  title: "Admin — Chez Misou",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!adminEmails.includes(user.email!.toLowerCase())) {
    redirect("/admin/login?error=unauthorized");
  }

  const newQuoteCount = await prisma.quoteRequest.count({
    where: { status: "new" },
  });

  return (
    <div className="min-h-screen flex bg-blanc-creme">
      <AdminSidebar userEmail={user.email!} newQuoteCount={newQuoteCount} />
      <main className="flex-1 lg:ml-64 p-6 lg:p-10 pt-20 lg:pt-10">
        {children}
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
