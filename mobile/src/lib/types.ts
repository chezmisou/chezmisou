export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  isFeatured: boolean;
  imageUrl: string | null;
  fromPrice: number;
  inStock: boolean;
}

export interface Catalog {
  shippingCost: number;
  freeThreshold: number;
  products: ProductSummary[];
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  images: { url: string; alt: string | null }[];
  variants: { id: string; name: string; price: number; stock: number }[];
}

export interface LacChurch {
  id: string;
  name: string;
  address: string;
}

export interface LacDeliveryTier {
  upToKm: number | null;
  price: number;
}

export interface LacDish {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  price: number;
  remaining: number | null;
}

export interface LacData {
  menu: {
    id: string;
    serviceDate: string;
    orderDeadline: string;
    info: string | null;
    isOpen: boolean;
    dishes: LacDish[];
  } | null;
  churches: LacChurch[];
  tiers: LacDeliveryTier[];
}

export interface TraiteurDish {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  category: string;
  baseInfo: string | null;
  formats: { id: string; minPeople: number; maxPeople: number; pricePerPerson: number }[];
}

export interface TraiteurData {
  enabled: boolean;
  preview: boolean;
  dishes: TraiteurDish[];
}

export interface Order {
  id: string;
  orderNumber: string;
  type: "epicerie" | "lac";
  status: string;
  paymentProvider: string | null;
  paymentStatus: string;
  deliveryMethod: "shipping" | "pickup" | "local_delivery";
  pickupLocation: string | null;
  deliveryDistanceKm: number | null;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  notes: string | null;
  lacMenuId: string | null;
  createdAt: string;
  customer: { email: string; firstName: string | null; lastName: string | null; phone: string | null } | null;
  guestEmail: string | null;
  address: { line1: string; line2: string | null; postalCode: string; city: string; country: string } | null;
  items: { id: string; itemType: string; name: string; unitPrice: number; quantity: number }[];
}

export interface AppliedPromo {
  code: string;
  promoCodeId: string;
  discountAmount: number;
}

export function customerName(o: Order): string {
  const n = `${o.customer?.firstName ?? ""} ${o.customer?.lastName ?? ""}`.trim();
  return n || o.customer?.email || o.guestEmail || "Client";
}

/** Préparation d'un dimanche (admin). */
export interface LacPrep {
  menu: { id: string; serviceDate: string; orderDeadline: string; isPublished: boolean; info: string | null };
  dishes: {
    id: string;
    name: string;
    description: string | null;
    photoUrl: string | null;
    price: number;
    maxQuantity: number | null;
    ordered: number;
  }[];
  revenue: number;
  pickupGroups: { church: string; orders: Order[] }[];
  deliveries: Order[];
}
