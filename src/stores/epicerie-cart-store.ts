import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EpicerieCartItem {
  id: string;
  productId: string;
  nameFr: string;
  nameCr: string;
  size: string;
  image: string;
  quantity: number;
  unitPrice: number;
  category: string;
  accentColor: string;
}

interface EpicerieCartState {
  items: EpicerieCartItem[];
  addItem: (item: Omit<EpicerieCartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useEpicerieCartStore = create<EpicerieCartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `epicerie-${item.productId}`;
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

      clearCart: () => set({ items: [] }),

      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "chez-misou-epicerie-cart",
    }
  )
);
