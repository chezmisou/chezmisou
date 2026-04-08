import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus } from "lucide-react";

function getMenuStatus(menu: { isPublished: boolean; serviceDate: Date; orderDeadline: Date }) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const serviceDay = new Date(menu.serviceDate);
  serviceDay.setHours(0, 0, 0, 0);

  if (serviceDay < today) {
    return { label: "Passé", className: "bg-gris-chaud/15 text-gris-chaud" };
  }
  if (!menu.isPublished) {
    return { label: "Brouillon", className: "bg-gris-chaud/20 text-text-dark" };
  }
  if (menu.isPublished && new Date(menu.orderDeadline) < now) {
    return { label: "Fermé", className: "bg-orange-clair/30 text-orange" };
  }
  return { label: "Publié", className: "bg-green-100 text-green-700" };
}

export default async function AdminLacPage() {
  const menus = await prisma.lacMenu.findMany({
    include: {
      dishes: { orderBy: { position: "asc" } },
      _count: { select: { dishes: true } },
    },
    orderBy: { serviceDate: "desc" },
  });

  const menusWithOrderCounts = await Promise.all(
    menus.map(async (menu) => {
      const orderCount = await prisma.order.count({
        where: { type: "lac", lacMenuId: menu.id, paymentStatus: "paid" },
      });
      return { ...menu, orderCount };
    })
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-marron-profond">
          Menus Lunch After Church
        </h1>
        <Link
          href="/admin/lac/nouveau"
          className="inline-flex items-center gap-2 bg-orange text-blanc px-5 py-2.5 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
        >
          <Plus size={18} />
          Nouveau menu
        </Link>
      </div>

      {menusWithOrderCounts.length === 0 ? (
        <div className="bg-blanc rounded-2xl p-12 shadow-sm border border-marron-doux/20 text-center">
          <p className="font-serif text-xl text-marron-profond mb-2">
            Aucun menu pour le moment
          </p>
          <p className="text-gris-chaud mb-6">
            Créez votre premier menu Lunch After Church pour commencer à recevoir des commandes du dimanche.
          </p>
          <Link
            href="/admin/lac/nouveau"
            className="inline-flex items-center gap-2 bg-orange text-blanc px-6 py-3 rounded-xl font-semibold hover:bg-orange-vif transition-colors"
          >
            <Plus size={18} />
            Créer le premier menu
          </Link>
        </div>
      ) : (
        <div className="bg-blanc rounded-2xl shadow-sm border border-marron-doux/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-marron-doux/20">
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Date du dimanche
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Deadline
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Plats
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Commandes
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gris-chaud text-xs uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {menusWithOrderCounts.map((menu) => {
                  const status = getMenuStatus(menu);
                  return (
                    <tr
                      key={menu.id}
                      className="border-b border-marron-doux/10 hover:bg-blanc-creme/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-marron-profond font-medium capitalize">
                        {format(menu.serviceDate, "EEEE d MMMM yyyy", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-text-body capitalize">
                        {format(menu.orderDeadline, "EEEE d MMMM HH'h'mm", { locale: fr })}
                      </td>
                      <td className="py-3 px-4 text-center text-marron-profond">
                        {menu._count.dishes}
                      </td>
                      <td className="py-3 px-4 text-center text-marron-profond font-semibold">
                        {menu.orderCount}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-3">
                        <Link
                          href={`/admin/lac/${menu.id}/edit`}
                          className="text-orange hover:text-orange-vif text-sm font-medium"
                        >
                          Modifier
                        </Link>
                        <Link
                          href={`/admin/lac/${menu.id}/commandes`}
                          className="text-orange hover:text-orange-vif text-sm font-medium"
                        >
                          Voir commandes
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
