import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { productsApi, ordersApi } from '@/lib/api';
import type { Order, Product, OrderStatus } from '@/types';

interface ShopState {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (filters?: Record<string, any>) => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateSkuStock: (skuId: string, stock: number) => Promise<void>;
  addOrder: (orderData: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  uploadPaymentProof: (orderId: string, file: File, note?: string) => Promise<void>;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      // Inisialisasi awal menggunakan array kosong, bukan mockProducts lagi
      products: [],
      orders: [],
      isLoading: false,
      error: null,

      // 1. Ambil data produk dinamis dari backend dengan Server-side Query Parameters
      fetchProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          const apiParams: Record<string, any> = { limit: 100 };
          
          if (filters?.search) apiParams.q = filters.search;
          if (filters?.category) apiParams.categorySlug = filters.category.toLowerCase();
          if (filters?.color) apiParams.color = filters.color;
          if (filters?.size) apiParams.size = filters.size;
          if (filters?.minPrice) apiParams.minPrice = filters.minPrice;
          if (filters?.maxPrice) apiParams.maxPrice = filters.maxPrice;

          const response = await productsApi.getAll(apiParams);
          const items = response.data?.items || response.data || [];
          
          // Normalisasi Mismatch Struktur Data Backend -> Frontend
          const normalizedProducts = items.map((product: any) => ({
            ...product,
            // Backend mengirim imageUrl (string tunggal), FE mengharapkan array images
            images: product.imageUrl ? [product.imageUrl] : ['/placeholder-shoes.png'],
            // Backend mengirim objek category atau categoryId, FE mengharapkan string label
            category: product.category?.name || product.category || 'Uncategorized'
          }));

          set({ products: normalizedProducts, isLoading: false });
        } catch (err: any) {
          console.error('Zustand fetchProducts Error:', err);
          set({ error: 'Gagal memuat katalog produk terbaru.', isLoading: false });
        }
      },

      // 2. Ambil data transaksi riil milik pengguna yang sedang login
      fetchOrders: async () => {
        try {
          const response = await ordersApi.getMyOrders();
          set({ orders: response.data || [] });
        } catch (err) {
          console.error('Zustand fetchOrders Error:', err);
        }
      },

      // 3. Sinkronisasi update stok inventory Admin ke database via PATCH /inventories/:skuId
      updateSkuStock: async (skuId, stock) => {
        try {
          await productsApi.updateStock(skuId, { type: 'STOCK', stock });
          
          // Perbarui local state agar UI Admin langsung ter-refresh secara responsif
          set((state) => ({
            products: state.products.map((product) => ({
              ...product,
              skus: product.skus.map((sku) =>
                sku.id === skuId ? { ...sku, stock: Math.max(0, stock) } : sku
              ),
            })),
          }));
        } catch (err) {
          console.error('Zustand updateSkuStock Error:', err);
          throw err;
        }
      },

      // 4. Integrasi Pembuatan Pesanan Baru (Checkout) via POST /checkout
      addOrder: async (orderData) => {
        try {
          const response = await ordersApi.checkout(orderData);
          const newOrder = response.data;
          set((state) => ({ orders: [newOrder, ...state.orders] }));
        } catch (err: any) {
          console.error('Zustand addOrder Error:', err);
          throw new Error(err.response?.data?.message || 'Proses checkout gagal.');
        }
      },

      // 5. Update Status Pesanan Admin via PATCH /orders/:id/status
      updateOrderStatus: async (orderId, status) => {
        try {
          await ordersApi.updateStatus(orderId, status);
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
            ),
          }));
        } catch (err) {
          console.error('Zustand updateOrderStatus Error:', err);
        }
      },

      // 6. Upload Bukti Pembayaran Multipart Form-Data (Mendukung parameter Note opsional)
      uploadPaymentProof: async (orderId, file, note) => {
        try {
          const response = await ordersApi.uploadProof(orderId, file, note);
          const updatedOrder = response.data;
          
          set((state) => ({
            orders: state.orders.map((order) =>
              order.id === orderId ? { ...order, ...updatedOrder, updatedAt: new Date().toISOString() } : order
            ),
          }));
        } catch (err) {
          console.error('Zustand uploadPaymentProof Error:', err);
          throw err;
        }
      },
    }),
    {
      name: 'sneakerlocal-shop',
      storage: createJSONStorage(() => localStorage),
      // CRITICAL SECURITY FIX: Membatasi partisi local storage hanya untuk melacak history orders saja.
      // Data katalog 'products' tidak boleh dipersist karena bersifat publik dan dinamis.
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);