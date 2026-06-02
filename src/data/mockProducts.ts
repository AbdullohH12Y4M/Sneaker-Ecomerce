import type { Product } from '@/types';

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Sneaker Lokal Malang',
    slug: 'sneaker-lokal-malang',
    description:
      'Sneakers lokal dengan bahan breathable, cocok untuk kampus dan nongkrong. Varian warna ringkas, harga mahasiswa, kualitas juara.',
    basePrice: 249000,
    category: 'SNEAKERS',
    images: [
      'https://placehold.co/600x600/111827/ffffff?text=Sneaker+Hitam',
      'https://placehold.co/600x600/ffffff/111827?text=Sneaker+Putih',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skus: [
      { id: 'sku-1', productId: 'prod-1', color: 'Hitam', colorHex: '#111827', size: 39, stock: 4, price: 249000 },
      { id: 'sku-2', productId: 'prod-1', color: 'Hitam', colorHex: '#111827', size: 42, stock: 2, price: 249000 },
      { id: 'sku-3', productId: 'prod-1', color: 'Putih', colorHex: '#f8fafc', size: 40, stock: 1, price: 249000 },
      { id: 'sku-4', productId: 'prod-1', color: 'Putih', colorHex: '#f8fafc', size: 43, stock: 0, price: 249000 },
      { id: 'sku-5', productId: 'prod-1', color: 'Merah', colorHex: '#dc2626', size: 41, stock: 3, price: 259000 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Sepatu Kasual Campus',
    slug: 'sepatu-kasual-campus',
    description:
      'Sepatu kasual ringan dengan sol empuk. Pilihan warna netral untuk acara kampus dan hangout.',
    basePrice: 199000,
    category: 'CASUAL',
    images: [
      'https://placehold.co/600x600/374151/ffffff?text=Kasual+Navy',
      'https://placehold.co/600x600/7c3aed/ffffff?text=Kasual+Ungu',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skus: [
      { id: 'sku-6', productId: 'prod-2', color: 'Navy', colorHex: '#1e293b', size: 38, stock: 5, price: 199000 },
      { id: 'sku-7', productId: 'prod-2', color: 'Navy', colorHex: '#1e293b', size: 40, stock: 2, price: 199000 },
      { id: 'sku-8', productId: 'prod-2', color: 'Coklat', colorHex: '#7c4d24', size: 42, stock: 6, price: 199000 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Formal Kantor Modern',
    slug: 'formal-kantor-modern',
    description:
      'Sepatu formal dengan desain ramping untuk presentasi dan acara kampus resmi. Finish elegan dan sentuhan modern.',
    basePrice: 329000,
    category: 'FORMAL',
    images: [
      'https://placehold.co/600x600/111827/ffffff?text=Formal+Hitam',
      'https://placehold.co/600x600/6b7280/ffffff?text=Formal+Abu',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skus: [
      { id: 'sku-9', productId: 'prod-3', color: 'Hitam', colorHex: '#111827', size: 42, stock: 2, price: 329000 },
      { id: 'sku-10', productId: 'prod-3', color: 'Abu', colorHex: '#6b7280', size: 41, stock: 1, price: 329000 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Sandal Santai Malang',
    slug: 'sandal-santai-malang',
    description:
      'Sandal nyaman untuk mahasiswa yang butuh gaya simpel dan budget-friendly. Flat rate ongkir untuk Malang Raya.',
    basePrice: 89000,
    category: 'SANDAL',
    images: [
      'https://placehold.co/600x600/4b5563/ffffff?text=Sandal+Hitam',
      'https://placehold.co/600x600/f59e0b/ffffff?text=Sandal+Kuning',
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    skus: [
      { id: 'sku-11', productId: 'prod-4', color: 'Hitam', colorHex: '#111827', size: 39, stock: 7, price: 89000 },
      { id: 'sku-12', productId: 'prod-4', color: 'Coklat', colorHex: '#7c4d24', size: 40, stock: 4, price: 89000 },
    ],
  },
];
