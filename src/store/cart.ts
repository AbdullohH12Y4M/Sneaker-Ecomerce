'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (skuId: string) => void;
  updateQuantity: (skuId: string, quantity: number) => void;
  clearCart: () => void;
  mergeWithServerCart: (serverItems: CartItem[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.skuId === newItem.skuId);
          if (existing) {
            // Increment quantity, capped at maxStock
            return {
              items: state.items.map((i) =>
                i.skuId === newItem.skuId
                  ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, i.maxStock) }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (skuId) => {
        set((state) => ({
          items: state.items.filter((i) => i.skuId !== skuId),
        }));
      },

      updateQuantity: (skuId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.skuId === skuId
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Merge local guest cart with server cart on login
      mergeWithServerCart: (serverItems) => {
        set((state) => {
          const merged = [...serverItems];
          state.items.forEach((localItem) => {
            const existsOnServer = merged.find((s) => s.skuId === localItem.skuId);
            if (existsOnServer) {
              // Add local quantity to server quantity (cap at maxStock)
              existsOnServer.quantity = Math.min(
                existsOnServer.quantity + localItem.quantity,
                existsOnServer.maxStock
              );
            } else {
              merged.push(localItem);
            }
          });
          return { items: merged };
        });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'sneakerlocal-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
