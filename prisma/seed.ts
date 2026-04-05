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

  // ─── Épicerie Fine — Categories ────────────────────────────────────
  const epicerieCategories = [
    { key: "EPIS" as const, labelFr: "Épices", labelCr: "Epis", accentColor: "#D4A017" },
    { key: "PIMENT" as const, labelFr: "Piments", labelCr: "Piman", accentColor: "#C0392B" },
    { key: "KREMAS" as const, labelFr: "Krémas", labelCr: "Krémas", accentColor: "#8E6F47" },
  ];

  for (const cat of epicerieCategories) {
    await prisma.epicerieCategoryInfo.upsert({
      where: { key: cat.key },
      update: { labelFr: cat.labelFr, labelCr: cat.labelCr, accentColor: cat.accentColor },
      create: { key: cat.key, labelFr: cat.labelFr, labelCr: cat.labelCr, accentColor: cat.accentColor },
    });
    console.log(`  ✅ EpicerieCategory: ${cat.labelFr}`);
  }

  // ─── Épicerie Fine — Products ─────────────────────────────────────
  const epicerieProducts = [
    { nameFr: "Pot d'Épice — Petit", nameCr: "Ti Pot Epis", category: "EPIS" as const, size: "250ml", price: 8.50, image: "🫙" },
    { nameFr: "Pot d'Épice — Moyen", nameCr: "Pot Epis Mwayen", category: "EPIS" as const, size: "500ml", price: 14.00, image: "🫙" },
    { nameFr: "Pot d'Épice — Grand", nameCr: "Gwo Pot Epis", category: "EPIS" as const, size: "1L", price: 22.00, image: "🫙" },
    { nameFr: "Pot de Piment — Petit", nameCr: "Ti Pot Piman", category: "PIMENT" as const, size: "150ml", price: 6.50, image: "🌶️" },
    { nameFr: "Pot de Piment — Moyen", nameCr: "Pot Piman Mwayen", category: "PIMENT" as const, size: "350ml", price: 11.00, image: "🌶️" },
    { nameFr: "Pot de Piment — Grand", nameCr: "Gwo Pot Piman", category: "PIMENT" as const, size: "500ml", price: 16.50, image: "🌶️" },
    { nameFr: "Kremas — Bouteille", nameCr: "Krémas an Boutèy", category: "KREMAS" as const, size: "750ml", price: 18.00, image: "🥥" },
  ];

  for (const prod of epicerieProducts) {
    const existing = await prisma.epicerieProduct.findFirst({
      where: { nameCr: prod.nameCr, size: prod.size },
    });
    if (!existing) {
      await prisma.epicerieProduct.create({
        data: { ...prod, defaultPrice: prod.price },
      });
    } else {
      await prisma.epicerieProduct.update({
        where: { id: existing.id },
        data: { nameFr: prod.nameFr, nameCr: prod.nameCr, image: prod.image },
      });
    }
    console.log(`  ✅ EpicerieProduct: ${prod.nameCr} (${prod.size})`);
  }

  // ─── Catalogue Épicerie (Lot 2a) ────────────────────────────────────
  const catalogProducts = [
    {
      name: "Krémas traditionnel",
      slug: "kremas-traditionnel",
      description: "Le trésor liquide d'Haïti. Notre krémas maison, onctueux et parfumé, élaboré selon la recette transmise de génération en génération. Lait de coco, lait concentré, rhum, muscade et cannelle. À déguster bien frais les soirs de fête ou en dessert.",
      basePrice: 18.90,
      isFeatured: true,
      variants: [
        { name: "250 ml", price: 12.90, stock: 30, position: 0 },
        { name: "500 ml", price: 18.90, stock: 25, position: 1 },
        { name: "1 L", price: 32.00, stock: 15, position: 2 },
      ],
    },
    {
      name: "Piment bouc en poudre",
      slug: "piment-bouc-poudre",
      description: "Le fameux piment bouc haïtien, séché et moulu artisanalement. Son parfum fruité et sa chaleur intense réveillent les griots, les poissons grillés et le riz national. Une pincée suffit.",
      basePrice: 7.50,
      isFeatured: false,
      variants: [
        { name: "Doux · 50 g", price: 7.50, stock: 40, position: 0 },
        { name: "Relevé · 50 g", price: 7.50, stock: 40, position: 1 },
        { name: "Feu ardent · 50 g", price: 8.50, stock: 25, position: 2 },
      ],
    },
    {
      name: "Pikliz maison",
      slug: "pikliz-maison",
      description: "Le condiment emblématique d'Haïti. Chou, carottes, oignons et piments confits au vinaigre, relevés de clous de girofle et de poivre. Incontournable avec les griots, les bananes frites ou les acras.",
      basePrice: 9.90,
      isFeatured: false,
      variants: [
        { name: "Pot 250 g", price: 9.90, stock: 35, position: 0 },
        { name: "Pot 500 g", price: 16.50, stock: 20, position: 1 },
      ],
    },
    {
      name: "Épices du Griot (mélange)",
      slug: "epices-griot",
      description: "Notre mélange secret pour des griots parfaits. Ail, thym, oignon, échalote, orange amère, persil, poivre : tout y est pour réussir ce plat national haïtien à tous les coups.",
      basePrice: 8.50,
      isFeatured: false,
      variants: [
        { name: "Sachet 80 g", price: 8.50, stock: 40, position: 0 },
      ],
    },
    {
      name: "Confiture de mangue",
      slug: "confiture-mangue",
      description: "Mangues haïtiennes à pleine maturité, cuites doucement avec peu de sucre pour préserver leur parfum solaire. À tartiner, à cuisiner, ou à la petite cuillère directement dans le pot.",
      basePrice: 11.00,
      isFeatured: true,
      variants: [
        { name: "Pot 240 g", price: 11.00, stock: 30, position: 0 },
      ],
    },
    {
      name: "Café des montagnes d'Haïti",
      slug: "cafe-montagnes-haiti",
      description: "Grains d'arabica cultivés en altitude dans le massif de la Selle. Un café doux, aux notes de cacao et de fruits révélées par une torréfaction artisanale. L'Haïti authentique dans votre tasse.",
      basePrice: 14.50,
      isFeatured: false,
      variants: [
        { name: "Grains · 250 g", price: 14.50, stock: 25, position: 0 },
        { name: "Moulu · 250 g", price: 14.50, stock: 25, position: 1 },
      ],
    },
    {
      name: "Sirop de canne brut",
      slug: "sirop-canne-brut",
      description: "Sirop de canne à sucre haïtien, non raffiné, aux arômes profonds de mélasse et de caramel. Idéal pour sucrer vos boissons, napper vos desserts ou parfumer vos marinades.",
      basePrice: 10.00,
      isFeatured: false,
      variants: [
        { name: "Bouteille 500 ml", price: 10.00, stock: 30, position: 0 },
      ],
    },
    {
      name: "Bouquet d'épices tropicales",
      slug: "bouquet-epices-tropicales",
      description: "Un coffret découverte de six épices essentielles de la cuisine haïtienne : piment bouc, muscade entière, clous de girofle, cannelle, anis étoilé et poivre de la Jamaïque. Le cadeau idéal pour les amoureux de saveurs.",
      basePrice: 24.00,
      isFeatured: true,
      variants: [
        { name: "Coffret 6 épices", price: 24.00, stock: 15, position: 0 },
      ],
    },
  ];

  for (const prod of catalogProducts) {
    const imageText = encodeURIComponent(prod.name);
    const imageUrl = `https://placehold.co/800x800/F0A05C/3B2314?font=playfair&text=${imageText}`;

    const product = await prisma.catalogProduct.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        basePrice: prod.basePrice,
        isFeatured: prod.isFeatured,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        basePrice: prod.basePrice,
        isFeatured: prod.isFeatured,
      },
    });

    // Upsert image (delete old + create)
    await prisma.catalogProductImage.deleteMany({ where: { productId: product.id } });
    await prisma.catalogProductImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: prod.name,
        position: 0,
      },
    });

    // Upsert variants (delete old + recreate)
    await prisma.catalogProductVariant.deleteMany({ where: { productId: product.id } });
    for (const v of prod.variants) {
      await prisma.catalogProductVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          position: v.position,
        },
      });
    }

    console.log(`  ✅ CatalogProduct: ${prod.name}`);
  }

  // ─── Settings ─────────────────────────────────────────────────────────
  await prisma.setting.upsert({
    where: { key: "shipping_cost_france" },
    update: { value: "6.90" },
    create: { key: "shipping_cost_france", value: "6.90" },
  });
  await prisma.setting.upsert({
    where: { key: "free_shipping_threshold" },
    update: { value: "60" },
    create: { key: "free_shipping_threshold", value: "60" },
  });
  console.log("  ✅ Settings: shipping_cost_france, free_shipping_threshold");

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
