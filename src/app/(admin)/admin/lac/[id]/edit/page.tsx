import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import LacMenuForm from "@/components/admin/LacMenuForm";

export default async function EditLacMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const menu = await prisma.lacMenu.findUnique({
    where: { id },
    include: {
      dishes: { orderBy: { position: "asc" } },
    },
  });

  if (!menu) {
    notFound();
  }

  const paidOrderCount = await prisma.order.count({
    where: { type: "lac", lacMenuId: id, paymentStatus: "paid" },
  });

  const serviceDate = menu.serviceDate.toISOString().split("T")[0];
  const deadline = new Date(menu.orderDeadline);
  const year = deadline.getFullYear();
  const month = String(deadline.getMonth() + 1).padStart(2, "0");
  const day = String(deadline.getDate()).padStart(2, "0");
  const hours = String(deadline.getHours()).padStart(2, "0");
  const minutes = String(deadline.getMinutes()).padStart(2, "0");
  const orderDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;

  const initialData = {
    id: menu.id,
    serviceDate,
    orderDeadline,
    deliveryZoneText: menu.deliveryZoneText || "",
    isPublished: menu.isPublished,
    dishes: menu.dishes.map((d) => ({
      name: d.name,
      description: d.description || "",
      photoUrl: d.photoUrl || "",
      price: Number(d.price),
      maxQuantity: d.maxQuantity,
    })),
    hasOrders: paidOrderCount > 0,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/admin/lac"
          className="inline-flex items-center gap-1 text-gris-chaud hover:text-marron-profond text-sm mb-2"
        >
          <ChevronLeft size={16} />
          Retour aux menus
        </Link>
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Modifier le menu
        </h1>
      </div>
      <LacMenuForm initialData={initialData} />
    </div>
  );
}
