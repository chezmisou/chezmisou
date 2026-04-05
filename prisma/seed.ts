import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: "shipping_cost_france", value: "6.90" },
    { key: "free_shipping_threshold", value: "60" },
    { key: "lac_default_deadline_day", value: "saturday" },
    { key: "lac_default_deadline_time", value: "18:00" },
    { key: "contact_email", value: "contact@chezmisou.com" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.log("Seed completed: Settings inserted.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
