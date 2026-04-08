import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ─── Settings ─────────────────────────────────────────────────────────
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
  console.log("  ✅ Settings inserted");

  // ─── Catalogue Épicerie ───────────────────────────────────────────────
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

    const product = await prisma.product.upsert({
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

    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: imageUrl,
        alt: prod.name,
        position: 0,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of prod.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          position: v.position,
        },
      });
    }

    console.log(`  ✅ Product: ${prod.name}`);
  }

  // ─── Catalogue Traiteur ────────────────────────────────────────────────
  const traiteurDishes = [
    {
      name: "Griot traditionnel",
      category: "Plat principal",
      description:
        "Le plat national haïtien par excellence. Viande de porc marinée aux agrumes et épices, puis frite jusqu'à tendreté parfaite. Accompagné de pikliz maison et de bananes pésées.",
      baseInfo: "Servi avec pikliz et bananes pésées",
      photoUrl:
        "https://placehold.co/800x800/F0A05C/3B2314?font=playfair&text=Griot",
      formats: [
        { minPeople: 5, maxPeople: 9, indicativePricePerPerson: 18.0 },
        { minPeople: 10, maxPeople: 19, indicativePricePerPerson: 15.0 },
        { minPeople: 20, maxPeople: 50, indicativePricePerPerson: 12.0 },
      ],
    },
    {
      name: "Poulet créole",
      category: "Plat principal",
      description:
        "Poulet mijoté dans une sauce créole riche en saveurs — tomate, piment, thym, ail et oignon. Un classique réconfortant et généreux.",
      baseInfo: "Servi avec riz djôn djôn ou riz blanc",
      photoUrl:
        "https://placehold.co/800x800/F0A05C/3B2314?font=playfair&text=Poulet+cr%C3%A9ole",
      formats: [
        { minPeople: 5, maxPeople: 9, indicativePricePerPerson: 16.0 },
        { minPeople: 10, maxPeople: 19, indicativePricePerPerson: 13.0 },
        { minPeople: 20, maxPeople: 50, indicativePricePerPerson: 11.0 },
      ],
    },
    {
      name: "Riz djôn djôn",
      category: "Accompagnement",
      description:
        "Le riz emblématique d'Haïti, cuisiné avec des champignons noirs séchés (djôn djôn) qui lui donnent sa couleur profonde et son goût unique.",
      baseInfo: null,
      photoUrl:
        "https://placehold.co/800x800/F0A05C/3B2314?font=playfair&text=Riz+dj%C3%B4n+dj%C3%B4n",
      formats: [
        { minPeople: 5, maxPeople: 9, indicativePricePerPerson: 7.0 },
        { minPeople: 10, maxPeople: 50, indicativePricePerPerson: 5.5 },
      ],
    },
    {
      name: "Plateau de douceurs haïtiennes",
      category: "Dessert",
      description:
        "Un assortiment généreux de douceurs typiques : tablette pistache, pain patate, blan mangé et pâte de goyave. Pour clôturer vos événements sur une note sucrée et authentique.",
      baseInfo: null,
      photoUrl:
        "https://placehold.co/800x800/F0A05C/3B2314?font=playfair&text=Douceurs",
      formats: [
        { minPeople: 5, maxPeople: 15, indicativePricePerPerson: 8.0 },
        { minPeople: 16, maxPeople: 50, indicativePricePerPerson: 6.5 },
      ],
    },
  ];

  // Clean existing traiteur dishes for idempotency
  await prisma.traiteurDishFormat.deleteMany({});
  await prisma.traiteurDish.deleteMany({});

  for (const dish of traiteurDishes) {
    await prisma.traiteurDish.create({
      data: {
        name: dish.name,
        category: dish.category,
        description: dish.description,
        baseInfo: dish.baseInfo,
        photoUrl: dish.photoUrl,
        isActive: true,
        position: traiteurDishes.indexOf(dish),
        formats: {
          create: dish.formats,
        },
      },
    });
    console.log(`  ✅ Traiteur dish: ${dish.name}`);
  }

  console.log("\nSeed completed.");
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
