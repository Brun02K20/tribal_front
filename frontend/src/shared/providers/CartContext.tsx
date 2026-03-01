"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AddCartItemInput, CartContextType, CartItem } from "@/types/cart";

const STORAGE_KEY = "cart.items";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as CartItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistItems = (nextItems: CartItem[]) => {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const addItem = (item: AddCartItemInput) => {
    const quantityToAdd = Math.max(1, Number(item.quantity ?? 1));

    const existing = items.find((cartItem) => cartItem.id === item.id);
    if (!existing) {
      persistItems([
        ...items,
        {
          ...item,
          quantity: Math.min(quantityToAdd, Math.max(0, Number(item.stock))),
        },
      ]);
      return;
    }

    const nextQuantity = Math.min(existing.quantity + quantityToAdd, Math.max(0, Number(existing.stock)));
    persistItems(
      items.map((cartItem) =>
        cartItem.id === item.id
          ? {
              ...cartItem,
              quantity: nextQuantity,
            }
          : cartItem,
      ),
    );
  };

  const removeItem = (id: number) => {
    persistItems(items.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    const safeQuantity = Math.max(0, Math.floor(quantity));
    if (safeQuantity === 0) {
      removeItem(id);
      return;
    }

    persistItems(
      items.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          quantity: Math.min(safeQuantity, Math.max(0, Number(item.stock))),
        };
      }),
    );
  };

  const clearCart = () => {
    setItems([]);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart }),
    [items, totalItems, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }

  return context;
};
