import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PromoCodeForm from "@/components/admin/PromoCodeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEditPromoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const promo = await prisma.promoCode.findUnique({
    where: { id },
    include: {
      products: true,
      _count: { select: { redemptions: true } },
    },
  });

  if (!promo) notFound();

  const initialData = {
    id: promo.id,
    code: promo.code,
    description: promo.description || "",
    discountType: promo.discountType as "percentage" | "fixed_amount",
    discountValue: String(Number(promo.discountValue)),
    minOrderAmount: promo.minOrderAmount ? String(Number(promo.minOrderAmount)) : "",
    appliesTo: promo.appliesTo,
    usageLimit: promo.usageLimit ? String(promo.usageLimit) : "",
    usageLimitPerCustomer: promo.usageLimitPerCustomer
      ? String(promo.usageLimitPerCustomer)
      : "",
    validFrom: promo.validFrom
      ? promo.validFrom.toISOString().slice(0, 10)
      : "",
    validUntil: promo.validUntil
      ? promo.validUntil.toISOString().slice(0, 10)
      : "",
    isActive: promo.isActive,
    productIds: promo.products.map((p) => p.productId),
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/promos"
        className="inline-flex items-center gap-1 text-sm text-text-body hover:text-orange transition-colors"
      >
        <ArrowLeft size={16} />
        Retour à la liste
      </Link>

      <h1 className="font-serif text-3xl font-bold text-marron-profond">
        Modifier le code « {promo.code} »
      </h1>

      <PromoCodeForm
        initialData={initialData}
        hasRedemptions={promo._count.redemptions > 0}
      />
    </div>
  );
}
