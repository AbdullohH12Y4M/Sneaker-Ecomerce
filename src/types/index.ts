// ─── User & Auth ────────────────────────────────────────────────────────────
export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: UserRole;
  createdAt: string;
}

// ─── Product & SKU ──────────────────────────────────────────────────────────
export type ProductCategory = 'SNEAKERS' | 'CASUAL' | 'FORMAL' | 'SANDAL' | 'BOOTS';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  category: ProductCategory;
  images: string[];
  skus: ProductSKU[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSKU {
  id: string;
  productId: string;
  color: string;
  colorHex: string;
  size: number;
  stock: number;
  price?: number; // override base price if needed
}

export interface ProductFilters {
  category?: ProductCategory;
  color?: string;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── Cart ────────────────────────────────────────────────────────────────────
export interface CartItem {
  skuId: string;
  productId: string;
  productName: string;
  productSlug: string;
  image: string;
  color: string;
  colorHex: string;
  size: number;
  price: number;
  quantity: number;
  maxStock: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ─── Order ───────────────────────────────────────────────────────────────────
export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ShippingType = 'COURIER' | 'PICKUP';
export type PaymentMethod = 'TRANSFER' | 'MIDTRANS' | 'COD';

export interface ShippingZone {
  id: string;
  district: string;  // Kecamatan di Malang
  price: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  sku: ProductSKU & { product: Product };
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  items: OrderItem[];
  totalPrice: number;
  shippingType: ShippingType;
  shippingAddress?: string;
  shippingDistrict?: string;
  shippingCost: number;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  paymentDeadline?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API Responses ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Form Types ──────────────────────────────────────────────────────────────
export interface CheckoutForm {
  shippingType: ShippingType;
  address: string;
  district: string;
  notes: string;
  paymentMethod: PaymentMethod;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
