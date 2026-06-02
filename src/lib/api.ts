import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — attach auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor — handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API Functions ─────────────────────────────────────────────────────────

// Products
export const productsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get('/products', { params }),
  getBySlug: (slug: string) =>
    api.get(`/products/${slug}`),
  create: (data: FormData) =>
    api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateProduct: (id: string, data: any) =>
    api.patch(`/products/${id}`, data),
  updateSku: (id: string, data: any) =>
    api.patch(`/skus/${id}`, data),
  updateStock: (skuId: string, data: { stock: number }) =>
    api.patch(`/inventories/${skuId}`, data),
  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/products/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// Orders
export const ordersApi = {
  checkout: (data: any) => api.post('/checkout', data),
  getMyOrders: (params?: Record<string, unknown>) =>
    api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  uploadProof: (orderId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/orders/${orderId}/payment-proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // Admin
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
};

// Auth
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

