'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { CartItem, Produto } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addItem: (produto: Produto, quantidade?: number) => void;
  removeItem: (produtoId: number) => void;
  updateQuantity: (produtoId: number, quantidade: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = 'primordi_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) ?? [] : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addItem = useCallback((produto: Produto, quantidade: number = 1) => {
    setItems((prev: CartItem[]) => {
      const existing = (prev ?? []).find((i: CartItem) => i?.produto?.id === produto?.id);
      if (existing) {
        return (prev ?? []).map((i: CartItem) =>
          i?.produto?.id === produto?.id
            ? { ...i, quantidade: (i?.quantidade ?? 0) + quantidade }
            : i
        );
      }
      return [...(prev ?? []), { produto, quantidade }];
    });
  }, []);

  const removeItem = useCallback((produtoId: number) => {
    setItems((prev: CartItem[]) => (prev ?? []).filter((i: CartItem) => i?.produto?.id !== produtoId));
  }, []);

  const updateQuantity = useCallback((produtoId: number, quantidade: number) => {
    if (quantidade <= 0) {
      setItems((prev: CartItem[]) => (prev ?? []).filter((i: CartItem) => i?.produto?.id !== produtoId));
      return;
    }
    setItems((prev: CartItem[]) =>
      (prev ?? []).map((i: CartItem) =>
        i?.produto?.id === produtoId ? { ...i, quantidade } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = (items ?? []).reduce((acc: number, i: CartItem) => acc + (i?.quantidade ?? 0), 0);
  const subtotal = (items ?? []).reduce((acc: number, i: CartItem) => {
    const price = i?.produto?.precoEfetivo ?? i?.produto?.preco ?? 0;
    return acc + price * (i?.quantidade ?? 0);
  }, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
