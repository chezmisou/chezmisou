// Order types and utilities for admin pages

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customizations?: unknown;
  product: {
    name: string;
    nameCreole: string;
    image: string | null;
    category: string;
  };
  size?: { label: string } | null;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: string;
  changedAt: string;
  changedBy: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  deliveryMethod: string;
  deliveryAddress: string | null;
  deliverySlot: string | null;
  deliveryDate: string | null;
  guestCount: number | null;
  paymentMethod: string;
  paymentStatus: string;
  promoCode: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { name: string | null; email: string | null; phone: string | null } | null;
  address?: {
    street: string;
    city: string;
    state: string | null;
    zipCode: string | null;
  } | null;
  items: OrderItem[];
  statusHistory: OrderStatusHistoryEntry[];
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    todayOrders: number;
    pendingCount: number;
    todayRevenue: number;
    typeBreakdown: Record<string, number>;
  };
}

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PREPARING: "En préparation",
  READY: "Prête",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  PREPARING: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  READY: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export const TYPE_LABELS: Record<string, string> = {
  TRAITEUR: "Traiteur",
  EPICERIE_FINE: "Épicerie fine",
  LUNCH_AFTER_CHURCH: "Lunch After Church",
};

export const DELIVERY_LABELS: Record<string, string> = {
  DELIVERY: "Livraison",
  PICKUP: "Retrait en boutique",
};

// Allowed next statuses from a given status
export const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function getCustomerName(order: Order): string {
  return order.user?.name || order.guestName || "Client inconnu";
}

export function getCustomerContact(order: Order): string {
  return (
    order.user?.email ||
    order.guestEmail ||
    order.user?.phone ||
    order.guestPhone ||
    ""
  );
}

export function getCustomerPhone(order: Order): string {
  return order.user?.phone || order.guestPhone || "";
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} HTG`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
