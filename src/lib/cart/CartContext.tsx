"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "chezmisou_cart_epicerie";

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Module-level external store for localStorage-backed cart
let cartListeners: Array<() => void> = [];
let cartItems: CartItem[] = [];
let cartInitialized = false;

function initCart() {
  if (cartInitialized) return;
  cartInitialized = true;
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) cartItems = JSON.parse(stored);
  } catch {
    // ignore
  }
}

function persistCart() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
}

function notifyCart() {
  persistCart();
  for (const l of cartListeners) l();
}

function subscribeCart(listener: () => void) {
  initCart();
  cartListeners.push(listener);
  return () => {
    cartListeners = cartListeners.filter((l) => l !== listener);
  };
}

function getCartSnapshot(): CartItem[] {
  initCart();
  return cartItems;
}

function getCartServerSnapshot(): CartItem[] {
  return [];
}

function addCartItem(item: Omit<CartItem, "id">) {
  const existing = cartItems.find((i) => i.variantId === item.variantId);
  if (existing) {
    cartItems = cartItems.map((i) =>
      i.variantId === item.variantId
        ? { ...i, quantity: i.quantity + item.quantity }
        : i
    );
  } else {
    cartItems = [...cartItems, { ...item, id: generateId() }];
  }
  notifyCart();
}

function removeCartItem(id: string) {
  cartItems = cartItems.filter((i) => i.id !== id);
  notifyCart();
}

function updateCartQuantity(id: string, quantity: number) {
  if (quantity <= 0) {
    cartItems = cartItems.filter((i) => i.id !== id);
  } else {
    cartItems = cartItems.map((i) =>
      i.id === id ? { ...i, quantity } : i
    );
  }
  notifyCart();
}

function clearCartItems() {
  cartItems = [];
  notifyCart();
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot
  );

  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (item: Omit<CartItem, "id">) => addCartItem(item),
    []
  );
  const removeItem = useCallback(
    (id: string) => removeCartItem(id),
    []
  );
  const updateQuantity = useCallback(
    (id: string, quantity: number) => updateCartQuantity(id, quantity),
    []
  );
  const clearCart = useCallback(() => clearCartItems(), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
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
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
