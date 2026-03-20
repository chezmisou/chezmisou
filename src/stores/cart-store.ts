import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemCustomization {
  spiceLevel?: string;
  extras?: string[];
  restrictions?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  nameCreole: string;
  image: string;
  sizeId?: string;
  sizeLabel?: string;
  quantity: number;
  unitPrice: number;
  customizations?: CartItemCustomization;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  deliveryMethod: "DELIVERY" | "PICKUP";
  deliveryAddress: string;
  deliverySlot: string | null;
  notes: string;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null) => void;
  setDeliveryMethod: (method: "DELIVERY" | "PICKUP") => void;
  setDeliveryAddress: (address: string) => void;
  setDeliverySlot: (slot: string | null) => void;
  setNotes: (notes: string) => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      deliveryMethod: "DELIVERY",
      deliveryAddress: "",
      deliverySlot: null,
      notes: "",

      addItem: (item) => {
        const id = `${item.productId}-${item.sizeId || "default"}-${JSON.stringify(item.customizations || {})}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () =>
        set({ items: [], promoCode: null, notes: "", deliverySlot: null }),

      setPromoCode: (code) => set({ promoCode: code }),
      setDeliveryMethod: (method) => set({ deliveryMethod: method }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setDeliverySlot: (slot) => set({ deliverySlot: slot }),
      setNotes: (notes) => set({ notes }),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "chez-misou-cart",
    }
  )
);
