import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mockProducts } from '@/data/mockProducts';
import type { Order, Product, ProductSKU, OrderStatus, ShippingType, PaymentMethod } from '@/types';

interface ShopState {
  products: Product[];
  orders: Order[];
  updateSkuStock: (skuId: string, stock: number) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  uploadPaymentProof: (orderId: string, proofUrl: string) => void;
  addProduct: (product: Product) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      products: mockProducts,
      orders: [],

      updateSkuStock: (skuId, stock) =>
        set((state) => ({
          products: state.products.map((product) => ({
            ...product,
            skus: product.skus.map((sku) =>
              sku.id === skuId ? { ...sku, stock: Math.max(0, stock) } : sku
            ),
          })),
        })),

      addOrder: (order) =>
        set((state) => ({ orders: [order, ...state.orders] })),

      updateOrderStatus: (orderId, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
          ),
        })),

      uploadPaymentProof: (orderId, proofUrl) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, paymentProofUrl: proofUrl, updatedAt: new Date().toISOString() } : order
          ),
        })),

      addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),
    }),
    {
      name: 'sneakerlocal-shop',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
