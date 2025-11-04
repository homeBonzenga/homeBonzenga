/* @refresh reset */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SupabaseAuthContext } from "@/contexts/SupabaseAuthContext";

export interface CartItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  category?: string;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getStorageKey(userId?: string) {
  return userId ? `hb_cart_${userId}` : "hb_cart_guest";
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Safely access the auth context
  const authContext = useContext(SupabaseAuthContext);
  const user = authContext?.user || null;
  
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from localStorage on mount and when user changes
  useEffect(() => {
    try {
      const key = getStorageKey(user?.id);
      const raw = localStorage.getItem(key);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    }
  }, [user?.id]);

  // Persist to localStorage when items change
  useEffect(() => {
    try {
      const key = getStorageKey(user?.id);
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, user?.id]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity } : i);
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { totalItems, totalPrice } = useMemo(() => {
    const totals = items.reduce((acc, i) => {
      acc.count += i.quantity;
      acc.price += i.price * i.quantity;
      return acc;
    }, { count: 0, price: 0 });
    return { totalItems: totals.count, totalPrice: totals.price };
  }, [items]);

  const value: CartContextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  }), [items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Export hook separately to ensure Fast Refresh compatibility
export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};


