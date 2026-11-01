import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface EpicerieItem {
  variantId: string;
  productId: string;
  productName: string;
  variantName: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
}

export interface LacItem {
  lacDishId: string;
  dishName: string;
  price: number;
  quantity: number;
}

interface CartState {
  epicerie: EpicerieItem[];
  epicerieCount: number;
  epicerieSubtotal: number;
  addEpicerie: (item: Omit<EpicerieItem, "quantity">, quantity?: number) => void;
  setEpicerieQty: (variantId: string, quantity: number) => void;
  clearEpicerie: () => void;

  lacMenuId: string | null;
  lac: LacItem[];
  lacCount: number;
  lacSubtotal: number;
  setLacQty: (menuId: string, dish: Omit<LacItem, "quantity">, quantity: number) => void;
  clearLac: () => void;
}

const CartContext = createContext<CartState | null>(null);
const KEY = "chezmisou.carts.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [epicerie, setEpicerie] = useState<EpicerieItem[]>([]);
  const [lacMenuId, setLacMenuId] = useState<string | null>(null);
  const [lac, setLac] = useState<LacItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Restaure les paniers enregistrés sur le téléphone
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const data = JSON.parse(raw);
        setEpicerie(Array.isArray(data.epicerie) ? data.epicerie : []);
        setLacMenuId(typeof data.lacMenuId === "string" ? data.lacMenuId : null);
        setLac(Array.isArray(data.lac) ? data.lac : []);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify({ epicerie, lacMenuId, lac })).catch(() => {});
  }, [epicerie, lacMenuId, lac, loaded]);

  const value = useMemo<CartState>(() => {
    const epicerieCount = epicerie.reduce((s, i) => s + i.quantity, 0);
    const epicerieSubtotal = epicerie.reduce((s, i) => s + i.price * i.quantity, 0);
    const lacCount = lac.reduce((s, i) => s + i.quantity, 0);
    const lacSubtotal = lac.reduce((s, i) => s + i.price * i.quantity, 0);

    return {
      epicerie,
      epicerieCount,
      epicerieSubtotal,
      addEpicerie(item, quantity = 1) {
        setEpicerie((prev) => {
          const existing = prev.find((i) => i.variantId === item.variantId);
          if (existing) {
            return prev.map((i) =>
              i.variantId === item.variantId
                ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.stock) }
                : i
            );
          }
          return [...prev, { ...item, quantity: Math.min(quantity, item.stock) }];
        });
      },
      setEpicerieQty(variantId, quantity) {
        setEpicerie((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.variantId !== variantId)
            : prev.map((i) =>
                i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.stock) } : i
              )
        );
      },
      clearEpicerie() {
        setEpicerie([]);
      },

      lacMenuId,
      lac,
      lacCount,
      lacSubtotal,
      setLacQty(menuId, dish, quantity) {
        // Un panier LAC ne concerne qu'un seul dimanche
        const base = lacMenuId === menuId ? lac : [];
        const next =
          quantity <= 0
            ? base.filter((i) => i.lacDishId !== dish.lacDishId)
            : base.some((i) => i.lacDishId === dish.lacDishId)
              ? base.map((i) => (i.lacDishId === dish.lacDishId ? { ...i, ...dish, quantity } : i))
              : [...base, { ...dish, quantity }];
        setLacMenuId(menuId);
        setLac(next);
      },
      clearLac() {
        setLac([]);
        setLacMenuId(null);
      },
    };
  }, [epicerie, lac, lacMenuId]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé dans CartProvider");
  return ctx;
}
