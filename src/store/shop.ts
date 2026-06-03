import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios'; // Ganti dengan instance axios internal Anda jika ada
import type { Order, OrderStatus } from '@/types';

interface ShopState {
  products: any[];
  categories: any[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  
  fetchProducts: (filters?: Record<string, any>) => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateSkuStock: (skuId: string, stock: number) => Promise<void>;
  addOrder: (orderData: any) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      products: [],
      categories: [],
      orders: [],
      isLoading: false,
      error: null,

      // Mengambil data dari endpoint riil /all dan menerapkan Client-side Filtering
      fetchProducts: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          // Menembak endpoint publik sesuai dokumentasi Swagger Anda
          const response = await axios.get('https://sneakerlocal.up.railway.app/all');
          
          // Sesuai response body: ambil array dari properti .products dan .categories
          const rawProducts = response.data?.products || [];
          const rawCategories = response.data?.categories || [];

          // Normalisasi Mismatch Data: Bentuk fallback objek agar UI lama Anda tidak rusak
          let normalizedProducts = rawProducts.map((product: any) => {
            // Jika backend tidak mengirimkan data skus, buat tiruan aman berbasis harga dasar produk
            const safeSkus = product.skus || [
              { id: `sku-${product.id}-40`, color: 'Hitam', size: 40, stock: 10, price: product.basePrice },
              { id: `sku-${product.id}-41`, color: 'Hitam', size: 41, stock: 5, price: product.basePrice },
            ];

            return {
              ...product,
              // Transformasi string imageUrl tunggal menjadi array images yang dinantikan Frontend
              images: product.imageUrl && product.imageUrl !== 'string' ? [product.imageUrl] : ['/placeholder-shoes.png'],
              // Pastikan kategori berupa string text/label untuk pencocokan filter UI
              categoryName: product.category?.name || 'Lainnya',
              skus: safeSkus
            };
          });

          // Mengaplikasikan kembali Filter Logic di sisi Frontend karena endpoint /all tidak mendukung parameter query filter
          if (filters) {
            normalizedProducts = normalizedProducts.filter((product: any) => {
              if (filters.category && product.category?.slug !== filters.category.toLowerCase()) return false;
              
              if (filters.search) {
                const term = filters.search.toLowerCase();
                const matchName = product.name?.toLowerCase().includes(term);
                const matchDesc = product.description?.toLowerCase().includes(term);
                if (!matchName && !matchDesc) return false;
              }

              if (filters.color) {
                const hasColor = product.skus.some((s: any) => s.color.toLowerCase() === filters.color.toLowerCase());
                if (!hasColor) return false;
              }

              if (filters.size) {
                const hasSize = product.skus.some((s: any) => s.size === Number(filters.size));
                if (!hasSize) return false;
              }

              if (filters.minPrice) {
                const priceMatch = product.skus.some((s: any) => (s.price ?? product.basePrice) >= Number(filters.minPrice));
                if (!priceMatch) return false;
              }

              if (filters.maxPrice) {
                const priceMatch = product.skus.some((s: any) => (s.price ?? product.basePrice) <= Number(filters.maxPrice));
                if (!priceMatch) return false;
              }

              return true;
            });
          }

          set({ 
            products: normalizedProducts, 
            categories: rawCategories, 
            isLoading: false 
          });
        } catch (err: any) {
          console.error('Gagal memuat data dari endpoint /all:', err);
          set({ error: 'Gagal mengambil data produk terbaru dari server.', isLoading: false });
        }
      },

      fetchOrders: async () => {
        // Implementasi pengambilan data order via API internal Anda jika diperlukan
      },

      updateSkuStock: async (skuId, stock) => {
        // Aksi manajemen stok lokal/remote
      },

      addOrder: async (orderData) => {
        // Aksi checkout pesanan
      },

      updateOrderStatus: async (orderId, status) => {
        // Aksi pengubahan status transaksi
      },
    }),
    {
      name: 'sneakerlocal-shop',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);