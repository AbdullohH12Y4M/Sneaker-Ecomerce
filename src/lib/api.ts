import axios from 'axios';
import { signOut } from 'next-auth/react';
import { isMockApiEnabled } from './mock-api';
import { mockHandlers } from './mock-api/handlers';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL!;

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isMockApiEnabled()) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        signOut({ redirect: true, callbackUrl: '/login' });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { isMockApiEnabled };

// ─── API Functions ─────────────────────────────────────────────────────────

export const productsApi = {
  getAll: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listProducts(params)
      : api.get('/products', { params }),
  getAllPublic: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listProducts({ ...params, limit: 100 })
      : api.get('/products', { params: { ...params, limit: 100 } }),
  listCatalog: () =>
    isMockApiEnabled() ? mockHandlers.listCatalog() : api.get('/products/all'),
  getBySlug: (slug: string) =>
    isMockApiEnabled()
      ? mockHandlers.getProductBySlug(slug)
      : api.get(`/products/${slug}`),
  getById: (id: string) =>
    isMockApiEnabled()
      ? mockHandlers.listProducts().then((res) => {
          const items = (res.data as { items?: unknown[] }).items ?? [];
          const found = items.find((p: { id?: string }) => p.id === id);
          if (!found) return Promise.reject({ response: { status: 404, data: { message: 'Not found' } } });
          return { ...res, data: found };
        })
      : api.get(`/products?id=${id}`),
  create: (data: {
    type: 'PRODUCT' | 'SKU';
    categoryId?: string;
    name?: string;
    slug?: string;
    basePrice?: number;
    color?: string;
    size?: string;
    initialStock?: number;
    productId?: string;
    colorHex?: string;
    stock?: number;
    price?: number;
    description?: string;
    isActive?: boolean;
    imageUrl?: string;
  }) =>
    isMockApiEnabled()
      ? mockHandlers.createProduct(data as Record<string, unknown>)
      : api.post('/products', data),
  updateProduct: (id: string, data: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.updateProduct(id, data)
      : api.patch(`/products/${id}`, data),
  updateSku: (id: string, data: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.updateSku(id, data)
      : api.patch(`/products/skus/${id}`, data),
  updateStock: (skuId: string, data: { type: 'STOCK'; stock: number }) =>
    isMockApiEnabled()
      ? mockHandlers.updateStock(skuId, data)
      : api.patch(`/products/inventories/${skuId}`, data),
  uploadImage: (id: string, file: File) => {
    if (isMockApiEnabled()) return mockHandlers.uploadProductImage(id);
    const form = new FormData();
    form.append('file', file);
    return api.post(`/products/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const categoriesApi = {
  getAll: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listCategories(params)
      : api.get('/categories', { params }),
  listAll: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listCategories({ ...params, limit: 100 })
      : api.get('/categories', { params: { ...params, limit: 100 } }),
  getOne: (id: string) =>
    isMockApiEnabled() ? mockHandlers.getCategory(id) : api.get(`/categories/${id}`),
  create: (data: { name: string; slug: string }) =>
    isMockApiEnabled()
      ? mockHandlers.createCategory(data)
      : api.post('/categories', data),
  update: (id: string, data: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.updateCategory(id, data)
      : api.patch(`/categories/${id}`, data),
  remove: (id: string) =>
    isMockApiEnabled() ? mockHandlers.deleteCategory(id) : api.delete(`/categories/${id}`),
};

export const ordersApi = {
  checkout: (data: Record<string, unknown>) =>
    isMockApiEnabled() ? mockHandlers.checkout(data) : api.post('/checkout', data),
  getMyOrders: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listMyOrders(params)
      : api.get('/orders', { params }),
  getAllOrders: (params?: Record<string, unknown>) =>
    isMockApiEnabled()
      ? mockHandlers.listAllOrders(params)
      : api.get('/orders/admin', { params }),
  getById: (id: string) =>
    isMockApiEnabled() ? mockHandlers.getOrder(id) : api.get(`/orders/${id}`),
  uploadProof: (orderId: string, file: File, note?: string) => {
    if (isMockApiEnabled()) return mockHandlers.uploadPaymentProof(orderId);
    const form = new FormData();
    form.append('file', file);
    if (note?.trim()) form.append('note', note.trim());
    return api.post(`/orders/${orderId}/payment-proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateStatus: (id: string, status: string) =>
    isMockApiEnabled()
      ? mockHandlers.updateOrderStatus(id, { status })
      : api.patch(`/orders/${id}/status`, { status }),
  deleteOrder: (id: string) =>
    isMockApiEnabled() ? mockHandlers.deleteOrder(id) : api.delete(`/${id}`),
  downloadReceipt: (id: string) =>
    isMockApiEnabled()
      ? mockHandlers.downloadReceipt(id)
      : api.get(`/orders/${id}/receipt`, { responseType: 'blob' }),
};

export const authApi = {
  registerCustomer: (data: { email: string; password: string }) =>
    isMockApiEnabled()
      ? mockHandlers.registerCustomer(data)
      : api.post('/auth/register/customer', data),
  registerAdmin: (data: { email: string; password: string }) =>
    isMockApiEnabled()
      ? mockHandlers.registerAdmin(data)
      : api.post('/auth/register/admin', data),
  login: (data: { email: string; password: string }) =>
    isMockApiEnabled() ? mockHandlers.login(data) : api.post('/auth/login', data),
  getAllUsers: () =>
    isMockApiEnabled() ? mockHandlers.getAllUsers() : api.get('/auth/users'),
};

export const appApi = {
  getHello: () => (isMockApiEnabled() ? mockHandlers.getHello() : api.get('/')),
};
