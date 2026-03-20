export type ProductCategory = "RIZ" | "SAUCES" | "VIANDES" | "BOISSONS" | "EPICES";

export interface ProductSize {
  id: string;
  label: string;
  labelCreole: string;
  servings: string;
  priceMultiplier: number;
}

export interface Product {
  id: string;
  name: string;
  nameCreole: string;
  description: string;
  price: number;
  image: string;
  category: ProductCategory;
  available: boolean;
  featured: boolean;
  sizes: ProductSize[];
}

export const DEFAULT_SIZES: ProductSize[] = [
  { id: "sm", label: "Ti Cocotte", labelCreole: "Ti Cocotte", servings: "1-2 pers.", priceMultiplier: 1 },
  { id: "md", label: "Cocotte Mwayen", labelCreole: "Cocotte Mwayen", servings: "3-5 pers.", priceMultiplier: 2.2 },
  { id: "lg", label: "Gwo Cocotte Familyal", labelCreole: "Gwo Cocotte Familyal", servings: "6-10 pers.", priceMultiplier: 3.5 },
];

export const SPICE_LEVELS = [
  { id: "dous", label: "Dous", labelFr: "Doux" },
  { id: "mwayen", label: "Mwayen", labelFr: "Moyen" },
  { id: "pike", label: "Pike", labelFr: "Épicé" },
  { id: "dife", label: "Dife!", labelFr: "Très épicé" },
];

export const EXTRAS = [
  { id: "pikliz", label: "Pikliz", price: 2 },
  { id: "bannann", label: "Bannann peze", price: 3 },
  { id: "salad", label: "Salade", price: 2.5 },
];

export const CATEGORIES: { id: ProductCategory; label: string; labelCreole: string; emoji: string }[] = [
  { id: "RIZ", label: "Riz", labelCreole: "Diri", emoji: "🍚" },
  { id: "SAUCES", label: "Sauces", labelCreole: "Sòs", emoji: "🫘" },
  { id: "VIANDES", label: "Viandes & Grillades", labelCreole: "Vyann & Grillade", emoji: "🍗" },
  { id: "BOISSONS", label: "Boissons", labelCreole: "Bwason", emoji: "🥤" },
  { id: "EPICES", label: "Épices & Condiments", labelCreole: "Epis & Kondimann", emoji: "🌶️" },
];

export const SAMPLE_PRODUCTS: Product[] = [
  // RIZ
  {
    id: "diri-djon-djon",
    name: "Diri Djon Djon",
    nameCreole: "Diri Djon Djon",
    description: "Riz aux champignons noirs, un classique haïtien parfumé et savoureux",
    price: 15,
    image: "/images/diri-djon-djon.jpg",
    category: "RIZ",
    available: true,
    featured: true,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "diri-kole-pwa",
    name: "Diri Kolé ak Pwa",
    nameCreole: "Diri Kolé ak Pwa",
    description: "Riz collé aux haricots rouges, comfort food par excellence",
    price: 12,
    image: "/images/diri-kole-pwa.jpg",
    category: "RIZ",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "diri-blan",
    name: "Diri Blan",
    nameCreole: "Diri Blan",
    description: "Riz blanc nature, parfait pour accompagner vos sauces préférées",
    price: 8,
    image: "/images/diri-blan.jpg",
    category: "RIZ",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "diri-ak-legim",
    name: "Diri ak Legim",
    nameCreole: "Diri ak Legim",
    description: "Riz aux légumes frais, coloré et nutritif",
    price: 13,
    image: "/images/diri-ak-legim.jpg",
    category: "RIZ",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  // SAUCES
  {
    id: "sos-pwa-nwa",
    name: "Sos Pwa Nwa",
    nameCreole: "Sòs Pwa Nwa",
    description: "Sauce aux haricots noirs, riche et crémeuse",
    price: 14,
    image: "/images/sos-pwa-nwa.jpg",
    category: "SAUCES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "sos-pwa-wouj",
    name: "Sos Pwa Wouj",
    nameCreole: "Sòs Pwa Wouj",
    description: "Sauce aux haricots rouges, onctueuse et épicée",
    price: 14,
    image: "/images/sos-pwa-wouj.jpg",
    category: "SAUCES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "sos-keri",
    name: "Sos Kéri",
    nameCreole: "Sòs Kéri",
    description: "Sauce au curry créole, parfumée aux épices locales",
    price: 15,
    image: "/images/sos-keri.jpg",
    category: "SAUCES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "sos-kreyol",
    name: "Sos Kreyòl",
    nameCreole: "Sòs Kreyòl",
    description: "Sauce créole traditionnelle aux tomates et épices",
    price: 13,
    image: "/images/sos-kreyol.jpg",
    category: "SAUCES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  // VIANDES
  {
    id: "griyo",
    name: "Griyo",
    nameCreole: "Griyo",
    description: "Porc frit croustillant, mariné aux agrumes et épices — le roi de la table haïtienne",
    price: 18,
    image: "/images/griyo.jpg",
    category: "VIANDES",
    available: true,
    featured: true,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "tasso",
    name: "Tasso",
    nameCreole: "Tasso",
    description: "Bœuf frit assaisonné, tendre et savoureux",
    price: 20,
    image: "/images/tasso.jpg",
    category: "VIANDES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "poulet-creole",
    name: "Poulet Créole",
    nameCreole: "Poul Kreyòl",
    description: "Poulet mijoté dans une sauce créole parfumée",
    price: 16,
    image: "/images/poulet-creole.jpg",
    category: "VIANDES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  {
    id: "poisson-gros-sel",
    name: "Poisson Gros Sel",
    nameCreole: "Pwason Gwo Sèl",
    description: "Poisson entier grillé au gros sel, croustillant à l'extérieur, fondant à l'intérieur",
    price: 22,
    image: "/images/poisson-gros-sel.jpg",
    category: "VIANDES",
    available: true,
    featured: false,
    sizes: DEFAULT_SIZES,
  },
  // BOISSONS
  {
    id: "kremas",
    name: "Krémas",
    nameCreole: "Krémas",
    description: "Liqueur crémeuse à la noix de coco, cannelle et rhum — la boisson des fêtes",
    price: 12,
    image: "/images/kremas.jpg",
    category: "BOISSONS",
    available: true,
    featured: true,
    sizes: [
      { id: "bottle-sm", label: "Petite bouteille", labelCreole: "Ti boutèy", servings: "250ml", priceMultiplier: 1 },
      { id: "bottle-lg", label: "Grande bouteille", labelCreole: "Gwo boutèy", servings: "750ml", priceMultiplier: 2.5 },
    ],
  },
  {
    id: "jus-kowosol",
    name: "Jus de Corossol",
    nameCreole: "Ji Kowosol",
    description: "Jus de corossol frais, naturellement sucré et rafraîchissant",
    price: 6,
    image: "/images/jus-kowosol.jpg",
    category: "BOISSONS",
    available: true,
    featured: false,
    sizes: [
      { id: "cup", label: "Verre", labelCreole: "Vè", servings: "350ml", priceMultiplier: 1 },
      { id: "jug", label: "Pichet", labelCreole: "Pichè", servings: "1L", priceMultiplier: 2.5 },
    ],
  },
  {
    id: "jus-grenadya",
    name: "Jus de Grenadia",
    nameCreole: "Ji Grenadya",
    description: "Jus de fruit de la passion, acidulé et désaltérant",
    price: 6,
    image: "/images/jus-grenadya.jpg",
    category: "BOISSONS",
    available: true,
    featured: false,
    sizes: [
      { id: "cup", label: "Verre", labelCreole: "Vè", servings: "350ml", priceMultiplier: 1 },
      { id: "jug", label: "Pichet", labelCreole: "Pichè", servings: "1L", priceMultiplier: 2.5 },
    ],
  },
  {
    id: "akasan",
    name: "Akasan",
    nameCreole: "Akasan",
    description: "Boisson épaisse au maïs, lait et épices — un délice crémeux traditionnel",
    price: 7,
    image: "/images/akasan.jpg",
    category: "BOISSONS",
    available: true,
    featured: false,
    sizes: [
      { id: "cup", label: "Verre", labelCreole: "Vè", servings: "350ml", priceMultiplier: 1 },
      { id: "jug", label: "Pichet", labelCreole: "Pichè", servings: "1L", priceMultiplier: 2.5 },
    ],
  },
  // EPICES
  {
    id: "epis-konple",
    name: "Épice Complet",
    nameCreole: "Epis Konplè",
    description: "Mélange d'épices haïtien tout-en-un pour assaisonner vos plats",
    price: 8,
    image: "/images/epis-konple.jpg",
    category: "EPICES",
    available: true,
    featured: false,
    sizes: [
      { id: "jar-sm", label: "Petit pot", labelCreole: "Ti po", servings: "200g", priceMultiplier: 1 },
      { id: "jar-lg", label: "Grand pot", labelCreole: "Gwo po", servings: "500g", priceMultiplier: 2 },
    ],
  },
  {
    id: "pikliz",
    name: "Pikliz",
    nameCreole: "Pikliz",
    description: "Condiment piquant aux légumes marinés — indispensable sur toute table haïtienne",
    price: 7,
    image: "/images/pikliz.jpg",
    category: "EPICES",
    available: true,
    featured: false,
    sizes: [
      { id: "jar-sm", label: "Petit pot", labelCreole: "Ti po", servings: "200g", priceMultiplier: 1 },
      { id: "jar-lg", label: "Grand pot", labelCreole: "Gwo po", servings: "500g", priceMultiplier: 2 },
    ],
  },
  {
    id: "beurre-pistach",
    name: "Beurre de Cacahuète",
    nameCreole: "Mantèg Pistach",
    description: "Beurre de cacahuète artisanal, onctueux et naturel",
    price: 9,
    image: "/images/beurre-pistach.jpg",
    category: "EPICES",
    available: true,
    featured: false,
    sizes: [
      { id: "jar-sm", label: "Petit pot", labelCreole: "Ti po", servings: "200g", priceMultiplier: 1 },
      { id: "jar-lg", label: "Grand pot", labelCreole: "Gwo po", servings: "500g", priceMultiplier: 2 },
    ],
  },
  {
    id: "sos-ti-malice",
    name: "Sòs Ti Malice",
    nameCreole: "Sòs Ti Malis",
    description: "Sauce piquante aux oignons et piments — la touche finale parfaite",
    price: 6,
    image: "/images/sos-ti-malice.jpg",
    category: "EPICES",
    available: true,
    featured: false,
    sizes: [
      { id: "jar-sm", label: "Petit pot", labelCreole: "Ti po", servings: "200g", priceMultiplier: 1 },
      { id: "jar-lg", label: "Grand pot", labelCreole: "Gwo po", servings: "500g", priceMultiplier: 2 },
    ],
  },
];
