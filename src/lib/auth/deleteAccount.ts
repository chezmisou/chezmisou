import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Supprime le compte d'un client (exigence App Store / Google Play + RGPD).
 *
 * - Le compte de connexion (Supabase Auth) est supprimé définitivement.
 * - Les adresses enregistrées non liées à une commande et les avis sont supprimés.
 * - Le profil client est détaché du compte et réduit au strict nécessaire :
 *   les commandes passées sont conservées pour les obligations comptables
 *   (factures), comme l'indique la politique de confidentialité.
 */
export async function deleteAccount(user: User): Promise<void> {
  const email = user.email?.trim().toLowerCase();

  const profiles = await prisma.customerProfile.findMany({
    where: { OR: [{ userId: user.id }, ...(email ? [{ email }] : [])] },
    select: { id: true },
  });
  const profileIds = profiles.map((p) => p.id);

  if (profileIds.length > 0) {
    await prisma.$transaction([
      prisma.address.deleteMany({
        where: { customerProfileId: { in: profileIds }, orders: { none: {} } },
      }),
      prisma.productReview.deleteMany({ where: { customerProfileId: { in: profileIds } } }),
      prisma.customerProfile.updateMany({
        where: { id: { in: profileIds } },
        data: { userId: null, phone: null, defaultAddressId: null },
      }),
    ]);
  }

  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) throw new Error(`Suppression du compte impossible : ${error.message}`);
}
