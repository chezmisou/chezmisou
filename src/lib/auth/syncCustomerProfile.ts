import type { User } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function syncCustomerProfile(user: User) {
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const firstName =
    (metadata.firstName as string | undefined) ??
    (metadata.first_name as string | undefined) ??
    (typeof metadata.given_name === "string" ? (metadata.given_name as string) : undefined) ??
    (typeof metadata.name === "string"
      ? (metadata.name as string).split(" ")[0]
      : undefined);
  const lastName =
    (metadata.lastName as string | undefined) ??
    (metadata.last_name as string | undefined) ??
    (typeof metadata.family_name === "string"
      ? (metadata.family_name as string)
      : undefined) ??
    (typeof metadata.name === "string"
      ? (metadata.name as string).split(" ").slice(1).join(" ") || undefined
      : undefined);

  let profile = await prisma.customerProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    const byEmail = await prisma.customerProfile.findUnique({
      where: { email },
    });

    if (byEmail) {
      profile = await prisma.customerProfile.update({
        where: { id: byEmail.id },
        data: {
          userId: user.id,
          firstName: byEmail.firstName ?? firstName ?? null,
          lastName: byEmail.lastName ?? lastName ?? null,
        },
      });
    } else {
      profile = await prisma.customerProfile.create({
        data: {
          userId: user.id,
          email,
          firstName: firstName ?? null,
          lastName: lastName ?? null,
        },
      });
    }
  }

  await prisma.order.updateMany({
    where: {
      guestEmail: email,
      customerProfileId: null,
    },
    data: {
      customerProfileId: profile.id,
    },
  });

  return profile;
}
