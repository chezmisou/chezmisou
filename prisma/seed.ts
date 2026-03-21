import { PrismaClient, RecurrenceFrequency, SlotStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Helper: get the Nth occurrence of a specific weekday in a month
// weekday: 0=Sunday, 1=Monday, ...
function getNthWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number,
  n: number
): Date | null {
  const firstDay = new Date(Date.UTC(year, month, 1));
  let firstWeekday = firstDay.getUTCDay();
  let dayOffset = (weekday - firstWeekday + 7) % 7;
  let day = 1 + dayOffset + (n - 1) * 7;

  // Check if the date is still in the same month
  const result = new Date(Date.UTC(year, month, day));
  if (result.getUTCMonth() !== month) return null;
  return result;
}

// Helper: get the last occurrence of a specific weekday in a month
function getLastWeekdayOfMonth(
  year: number,
  month: number,
  weekday: number
): Date {
  // Start from the last day of the month and work backwards
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  const lastDayWeekday = lastDay.getUTCDay();
  const diff = (lastDayWeekday - weekday + 7) % 7;
  return new Date(Date.UTC(year, month + 1, -diff));
}

// Generate Sunday dates for a recurrence frequency over a date range
function generateSundayDates(
  frequency: RecurrenceFrequency,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];

  // Iterate through each month in the range
  let current = new Date(
    Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1)
  );

  while (current <= endDate) {
    const year = current.getUTCFullYear();
    const month = current.getUTCMonth();
    let sunday: Date | null = null;

    switch (frequency) {
      case "MONTHLY_FIRST":
        sunday = getNthWeekdayOfMonth(year, month, 0, 1);
        break;
      case "MONTHLY_SECOND":
        sunday = getNthWeekdayOfMonth(year, month, 0, 2);
        break;
      case "MONTHLY_THIRD":
        sunday = getNthWeekdayOfMonth(year, month, 0, 3);
        break;
      case "MONTHLY_FOURTH":
        sunday = getNthWeekdayOfMonth(year, month, 0, 4);
        break;
      case "MONTHLY_LAST":
        sunday = getLastWeekdayOfMonth(year, month, 0);
        break;
      default:
        break;
    }

    if (sunday && sunday >= startDate && sunday <= endDate) {
      dates.push(sunday);
    }

    // Move to next month
    current = new Date(Date.UTC(year, month + 1, 1));
  }

  return dates;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Churches ──────────────────────────────────────────────────────────
  const churchesData = [
    {
      slug: "evidence",
      name: "Évidence",
      contactName: "Pasteur Marc",
      contactEmail: "contact@evidence-church.fr",
      color: "#8b5cf6",
    },
    {
      slug: "parole-de-vie",
      name: "Parole de Vie",
      contactName: "Pasteur Jean",
      contactEmail: "contact@parolevie.fr",
      color: "#06b6d4",
    },
    {
      slug: "icc-paris",
      name: "ICC Paris",
      contactName: "Pasteur David",
      contactEmail: "contact@icc-paris.fr",
      color: "#f59e0b",
    },
    {
      slug: "hillsong-paris",
      name: "Hillsong Paris",
      contactName: "Pasteur Sarah",
      contactEmail: "contact@hillsong.fr",
      color: "#ef4444",
    },
    {
      slug: "c3-church",
      name: "C3 Church",
      contactName: "Pasteur Paul",
      contactEmail: "contact@c3church.fr",
      color: "#10b981",
    },
  ];

  const churches = [];
  for (const data of churchesData) {
    const church = await prisma.church.upsert({
      where: { slug: data.slug },
      update: {
        name: data.name,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        color: data.color,
      },
      create: {
        name: data.name,
        slug: data.slug,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        color: data.color,
      },
    });
    churches.push(church);
    console.log(`  ✅ Church: ${church.name} (${church.id})`);
  }

  const [evidence, paroleDeVie, iccParis, hillsongParis] = churches;

  // ─── Recurrence Rules ──────────────────────────────────────────────────
  const today = new Date(Date.UTC(2026, 2, 21)); // 2026-03-21
  const threeMonthsLater = new Date(Date.UTC(2026, 5, 21)); // 2026-06-21

  const recurrenceData: {
    churchId: string;
    frequency: RecurrenceFrequency;
  }[] = [
    { churchId: evidence.id, frequency: "MONTHLY_FIRST" },
    { churchId: paroleDeVie.id, frequency: "MONTHLY_SECOND" },
    { churchId: iccParis.id, frequency: "MONTHLY_THIRD" },
    { churchId: hillsongParis.id, frequency: "MONTHLY_FOURTH" },
    // C3 Church has no recurrence rule (manual only)
  ];

  for (const data of recurrenceData) {
    // Check if a rule already exists for this church + frequency
    const existing = await prisma.recurrenceRule.findFirst({
      where: { churchId: data.churchId, frequency: data.frequency },
    });

    if (existing) {
      await prisma.recurrenceRule.update({
        where: { id: existing.id },
        data: { isActive: true, startDate: today },
      });
      console.log(`  ✅ RecurrenceRule updated: ${data.frequency} for churchId ${data.churchId}`);
    } else {
      await prisma.recurrenceRule.create({
        data: {
          churchId: data.churchId,
          frequency: data.frequency,
          isActive: true,
          startDate: today,
        },
      });
      console.log(`  ✅ RecurrenceRule created: ${data.frequency} for churchId ${data.churchId}`);
    }
  }

  // ─── Access Slots (next 3 months) ─────────────────────────────────────
  for (const rule of recurrenceData) {
    const sundayDates = generateSundayDates(
      rule.frequency,
      today,
      threeMonthsLater
    );

    for (const date of sundayDates) {
      await prisma.accessSlot.upsert({
        where: {
          churchId_date: {
            churchId: rule.churchId,
            date,
          },
        },
        update: {
          status: "SCHEDULED" as SlotStatus,
        },
        create: {
          churchId: rule.churchId,
          date,
          status: "SCHEDULED" as SlotStatus,
        },
      });
      console.log(
        `  ✅ AccessSlot: ${date.toISOString().split("T")[0]} for churchId ${rule.churchId}`
      );
    }
  }

  // ─── Users ─────────────────────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const churchPasswordHash = await bcrypt.hash("church123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@lac.fr" },
    update: {
      name: "Admin LAC",
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      email: "admin@lac.fr",
      name: "Admin LAC",
      password: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`  ✅ User: ${adminUser.name} (${adminUser.email})`);

  const managerUser = await prisma.user.upsert({
    where: { email: "evidence@lac.fr" },
    update: {
      name: "Manager Évidence",
      password: churchPasswordHash,
      role: "CHURCH_MANAGER",
      churchId: evidence.id,
    },
    create: {
      email: "evidence@lac.fr",
      name: "Manager Évidence",
      password: churchPasswordHash,
      role: "CHURCH_MANAGER",
      churchId: evidence.id,
    },
  });
  console.log(`  ✅ User: ${managerUser.name} (${managerUser.email})`);

  // ─── LAC Config ────────────────────────────────────────────────────────
  // Use a fixed ID so upsert works on reruns
  const lacConfigId = "lac-config-default";

  await prisma.lacConfig.upsert({
    where: { id: lacConfigId },
    update: {},
    create: {
      id: lacConfigId,
      maxChurchesPerSunday: 1,
      defaultStartTime: "12:00",
      defaultEndTime: "15:00",
      reminderEmailsEnabled: true,
      reminderDaysBefore: 3,
    },
  });
  console.log("  ✅ LacConfig created");

  console.log("\n🌱 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
