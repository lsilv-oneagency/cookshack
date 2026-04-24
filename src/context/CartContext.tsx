"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
} from "react";
import type { CartItem } from "@/types/miva";

interface CartState {
  items: CartItem[];
  sessionId: string | null;
  isOpen: boolean;
  isLoading: boolean;
}

type CartAction =
  | { type: "SET_SESSION"; sessionId: string }
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; product_code: string }
  | { type: "UPDATE_QTY"; product_code: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_CART" }
  | { type: "CLOSE_CART" }
  | { type: "SET_LOADING"; loading: boolean };

interface AddItemOptions {
  /** When false, adds to cart without opening the cart drawer (e.g. batched "Add all" on PDP). Default true. */
  openCart?: boolean;
}

interface CartContextValue extends CartState {
  addItem: (item: Omit<CartItem, "total">, options?: AddItemOptions) => Promise<void>;
  removeItem: (product_code: string) => void;
  updateQty: (product_code: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  total: number;
  itemCount: number;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, sessionId: action.sessionId };

    case "ADD_ITEM": {
      const existing = state.items.find(
        (i) => i.product_code === action.item.product_code
      );
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.product_code === action.item.product_code
              ? {
                  ...i,
                  quantity: i.quantity + action.item.quantity,
                  total: (i.quantity + action.item.quantity) * i.product_price,
                }
              : i
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.item],
      };
    }

    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product_code !== action.product_code),
      };

    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter((i) => i.product_code !== action.product_code),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product_code === action.product_code
            ? {
                ...i,
                quantity: action.quantity,
                total: action.quantity * i.product_price,
              }
            : i
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [], sessionId: null };

    case "TOGGLE_CART":
      return { ...state, isOpen: !state.isOpen };

    case "CLOSE_CART":
      return { ...state, isOpen: false };

    case "SET_LOADING":
      return { ...state, isLoading: action.loading };

    default:
      return state;
  }
}

const STORAGE_KEY = "miva_cart";

function loadFromStorage(): Partial<CartState> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    sessionId: null,
    isOpen: false,
    isLoading: false,
  });

  useEffect(() => {
    const stored = loadFromStorage();
    if (stored.items) {
      stored.items.forEach((item: CartItem) => dispatch({ type: "ADD_ITEM", item }));
    }
    if (stored.sessionId) {
      dispatch({ type: "SET_SESSION", sessionId: stored.sessionId });
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ items: state.items, sessionId: state.sessionId })
    );
  }, [state.items, state.sessionId, mounted]);

  const ensureSession = useCallback(async (): Promise<string> => {
    if (state.sessionId) return state.sessionId;

    const res = await fetch("/api/cart", { method: "POST" });
    const json = await res.json();
    const sessionId: string = json.data?.id || json.data?.session_id || crypto.randomUUID();
    dispatch({ type: "SET_SESSION", sessionId });
    return sessionId;
  }, [state.sessionId]);

  const addItem = useCallback(
    async (item: Omit<CartItem, "total">, options?: AddItemOptions) => {
      const openCart = options?.openCart !== false;
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        const sessionId = await ensureSession();

        await fetch("/api/cart/items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-basket-session": sessionId,
          },
          body: JSON.stringify({
            product_code: item.product_code,
            quantity: item.quantity,
          }),
        });

        dispatch({
          type: "ADD_ITEM",
          item: { ...item, total: item.quantity * item.product_price },
        });
        if (openCart) dispatch({ type: "TOGGLE_CART" });
      } catch (err) {
        console.error("addItem error", err);
        dispatch({
          type: "ADD_ITEM",
          item: { ...item, total: item.quantity * item.product_price },
        });
        if (openCart) dispatch({ type: "TOGGLE_CART" });
      } finally {
        dispatch({ type: "SET_LOADING", loading: false });
      }
    },
    [ensureSession]
  );

  const removeItem = useCallback((product_code: string) => {
    dispatch({ type: "REMOVE_ITEM", product_code });
  }, []);

  const updateQty = useCallback((product_code: string, quantity: number) => {
    dispatch({ type: "UPDATE_QTY", product_code, quantity });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleCart = useCallback(() => dispatch({ type: "TOGGLE_CART" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE_CART" }), []);

  const total = state.items.reduce((sum, i) => sum + i.total, 0);
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        toggleCart,
        closeCart,
        total,
        itemCount,
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
