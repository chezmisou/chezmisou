"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

export type LacCartItem = {
  id: string;
  lacMenuId: string;
  lacDishId: string;
  dishName: string;
  dishPhoto: string | null;
  price: number;
  quantity: number;
};

type LacCartState = {
  items: LacCartItem[];
  currentMenuId: string | null;
};

type LacCartContextType = {
  items: LacCartItem[];
  currentMenuId: string | null;
  addItem: (item: Omit<LacCartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const LacCartContext = createContext<LacCartContextType | null>(null);

const STORAGE_KEY = "chezmisou_cart_lac";

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Module-level external store for localStorage-backed cart
let lacListeners: Array<() => void> = [];
let lacState: LacCartState = { items: [], currentMenuId: null };
let lacInitialized = false;
let toastMessage: string | null = null;

function initLac() {
  if (lacInitialized) return;
  lacInitialized = true;
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) lacState = JSON.parse(stored);
  } catch {
    // ignore
  }
}

function persistLac() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lacState));
}

function notifyLac() {
  persistLac();
  for (const l of lacListeners) l();
}

function subscribeLac(listener: () => void) {
  initLac();
  lacListeners.push(listener);
  return () => {
    lacListeners = lacListeners.filter((l) => l !== listener);
  };
}

function getLacSnapshot(): LacCartState {
  initLac();
  return lacState;
}

function getLacServerSnapshot(): LacCartState {
  return { items: [], currentMenuId: null };
}

function addLacItem(item: Omit<LacCartItem, "id">) {
  // If the item belongs to a different menu, clear cart first
  if (lacState.currentMenuId && lacState.currentMenuId !== item.lacMenuId) {
    lacState = { items: [], currentMenuId: null };
    toastMessage = "Votre précédent panier a été remplacé par le nouveau menu.";
  }

  const existing = lacState.items.find(
    (i) => i.lacDishId === item.lacDishId
  );
  if (existing) {
    lacState = {
      currentMenuId: item.lacMenuId,
      items: lacState.items.map((i) =>
        i.lacDishId === item.lacDishId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      ),
    };
  } else {
    lacState = {
      currentMenuId: item.lacMenuId,
      items: [...lacState.items, { ...item, id: generateId() }],
    };
  }
  notifyLac();
}

function removeLacItem(id: string) {
  lacState = {
    ...lacState,
    items: lacState.items.filter((i) => i.id !== id),
  };
  if (lacState.items.length === 0) {
    lacState = { items: [], currentMenuId: null };
  }
  notifyLac();
}

function updateLacQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    removeLacItem(id);
    return;
  }
  lacState = {
    ...lacState,
    items: lacState.items.map((i) =>
      i.id === id ? { ...i, quantity } : i
    ),
  };
  notifyLac();
}

function clearLacItems() {
  lacState = { items: [], currentMenuId: null };
  notifyLac();
}

export function consumeToast(): string | null {
  const msg = toastMessage;
  toastMessage = null;
  return msg;
}

export function LacCartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeLac,
    getLacSnapshot,
    getLacServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<LacCartItem, "id">) => addLacItem(item),
    []
  );
  const removeItem = useCallback(
    (id: string) => removeLacItem(id),
    []
  );
  const updateQuantity = useCallback(
    (id: string, quantity: number) => updateLacQuantity(id, quantity),
    []
  );
  const clearCart = useCallback(() => clearLacItems(), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0
  );

  return (
    <LacCartContext.Provider
      value={{
        items: state.items,
        currentMenuId: state.currentMenuId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </LacCartContext.Provider>
  );
}

export function useLacCart() {
  const ctx = useContext(LacCartContext);
  if (!ctx)
    throw new Error("useLacCart must be used within LacCartProvider");
  return ctx;
}
