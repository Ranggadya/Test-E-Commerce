"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";

type CartProduct = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  category: string;
  stock: number;
  slug: string;
};

type CartItem = {
  id: number;
  product: CartProduct;
  quantity: number;
  size?: string | null;
  lineTotal: number;
};

type CartTotals = {
  subtotal: number;
  totalItems: number;
};

type CartSummary = {
  id: number | null;
  items: CartItem[];
  totals: CartTotals;
};

type CartContextValue = {
  cart: CartSummary | null;
  isLoading: boolean;
  error: string | null;
  addItem: (payload: {
    productId: number;
    quantity: number;
    size?: string;
  }) => Promise<void>;
  updateItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
};

const emptyCart: CartSummary = {
  id: null,
  items: [],
  totals: { subtotal: 0, totalItems: 0 },
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartResponse = {
  success: boolean;
  data: { cart: CartSummary };
};

async function fetchJson<T>(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.error?.message ??
      body?.message ??
      "Terjadi kesalahan pada server";
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(emptyCart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCart = useCallback(async () => {
    if (!user) {
      setCart(emptyCart);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchJson<CartResponse>("/api/cart");
      setCart(response.data.cart);
    } catch (err) {
      setCart(emptyCart);
      setError(err instanceof Error ? err.message : "Gagal memuat keranjang");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadCart();
    }
  }, [authLoading, loadCart]);

  const ensureAuthenticated = useCallback(() => {
    if (!user) {
      throw new Error("Silakan login untuk mengakses keranjang.");
    }
  }, [user]);

  const addItem = useCallback(
    async (payload: { productId: number; quantity: number; size?: string }) => {
      ensureAuthenticated();
      setError(null);
      await fetchJson<CartResponse>("/api/cart/items", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await loadCart();
    },
    [ensureAuthenticated, loadCart]
  );

  const updateItemQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      ensureAuthenticated();
      setError(null);
      await fetchJson<CartResponse>(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
      await loadCart();
    },
    [ensureAuthenticated, loadCart]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      ensureAuthenticated();
      setError(null);
      await fetchJson<CartResponse>(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });
      await loadCart();
    },
    [ensureAuthenticated, loadCart]
  );

  const clearCart = useCallback(async () => {
    ensureAuthenticated();
    setError(null);
    await fetchJson<CartResponse>("/api/cart", {
      method: "DELETE",
    });
    await loadCart();
  }, [ensureAuthenticated, loadCart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      isLoading,
      error,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      refresh: loadCart,
    }),
    [cart, isLoading, error, addItem, updateItemQuantity, removeItem, clearCart, loadCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
