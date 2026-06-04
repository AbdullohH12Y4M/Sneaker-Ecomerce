import { findMockUserByCredentials, parseMockToken, createMockAccessToken } from '@/data/mockUsers';
import type { MockProductRecord } from '@/data/mockCatalog';
import { getMockState, setMockState, nextId, type MockOrderRecord } from './store';

const SHIPPING_FEES: Record<string, number> = {
  LOWOKWARU: 10000,
  KLOJEN: 10000,
  BLIMBING: 12000,
  SUKUN: 12000,
  KEDUNGKANDANG: 15000,
};

function ok<T>(data: T, status = 200) {
  return Promise.resolve({ data, status, statusText: 'OK', headers: {}, config: {} as never });
}

function fail(message: string, status = 400) {
  const error = new Error(message) as Error & {
    response?: { data: { message: string }; status: number };
  };
  error.response = { data: { message }, status };
  return Promise.reject(error);
}

function getBearerToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

function requireUser(roles?: Array<'ADMIN' | 'CUSTOMER'>) {
  const user = parseMockToken(getBearerToken());
  if (!user) {
    return fail('Unauthorized', 401);
  }
  if (roles && !roles.includes(user.role)) {
    return fail('Forbidden', 403);
  }
  return Promise.resolve(user);
}

function withInventory(skus: MockProductRecord['skus']) {
  return skus.map((sku) => ({ ...sku, inventory: { stock: sku.stock } }));
}

function enrichProduct(p: MockProductRecord) {
  const state = getMockState();
  const category = state.categories.find((c) => c.id === p.categoryId) ?? p.category;
  return {
    ...p,
    category,
    images: p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : [],
    skus: withInventory(p.skus),
  };
}

function filterProducts(products: MockProductRecord[], params?: Record<string, unknown>) {
  let list = products.filter((p) => p.isActive);
  const q = String(params?.q ?? params?.search ?? '').toLowerCase();
  const categorySlug = String(params?.categorySlug ?? params?.category ?? '').toLowerCase();
  const color = String(params?.color ?? '');
  const size = params?.size ? Number(params.size) : 0;
  const minPrice = params?.minPrice ? Number(params.minPrice) : 0;
  const maxPrice = params?.maxPrice ? Number(params.maxPrice) : 0;

  if (categorySlug) {
    list = list.filter(
      (p) =>
        p.category.slug.toLowerCase() === categorySlug ||
        p.category.name.toLowerCase() === categorySlug
    );
  }
  if (q) {
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }
  return list.filter((p) => {
    const skus = p.skus.filter((s) => s.stock > 0);
    if (!skus.length) return false;
    if (color && !skus.some((s) => s.color.toLowerCase() === color.toLowerCase())) return false;
    if (size && !skus.some((s) => s.size === size)) return false;
    if (minPrice && !skus.some((s) => (s.price ?? p.basePrice) >= minPrice)) return false;
    if (maxPrice && maxPrice > 0 && !skus.some((s) => (s.price ?? p.basePrice) <= maxPrice)) return false;
    return true;
  });
}

function paginate<T>(items: T[], params?: Record<string, unknown>) {
  const page = Number(params?.page ?? 1);
  const limit = Number(params?.limit ?? 20);
  const start = (page - 1) * limit;
  return { page, limit, total: items.length, items: items.slice(start, start + limit) };
}

function buildOrderItems(items: Array<{ skuId: string; quantity: number }>) {
  const state = getMockState();
  const orderItems: MockOrderRecord['items'] = [];
  let subtotal = 0;

  for (const line of items) {
    const sku = state.products.flatMap((p) => p.skus).find((s) => s.id === line.skuId);
    if (!sku) throw new Error(`SKU ${line.skuId} not found`);
    const product = state.products.find((p) => p.id === sku.productId);
    if (!product?.isActive) throw new Error('Product not active');
    if (sku.stock < line.quantity) throw new Error(`Stok tidak cukup untuk ${sku.color} EU ${sku.size}`);

    const price = sku.price ?? product.basePrice;
    subtotal += price * line.quantity;
    orderItems.push({
      id: nextId('oi'),
      orderId: '',
      skuId: sku.id,
      quantity: line.quantity,
      price,
      priceAtPurchase: price,
      sku: { ...sku, product: enrichProduct(product) },
    });
  }
  return { orderItems, subtotal };
}

export const mockHandlers = {
  getHello: () => ok({ message: 'SneakerLocal Mock API — development mode' }),

  login: (body: { email: string; password: string }) => {
    const user = findMockUserByCredentials(body.email, body.password);
    if (!user) return fail('Email atau password salah', 401);
    return ok({
      access_token: createMockAccessToken(user.id),
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  },

  registerCustomer: (body: { email: string; password: string }) => {
    const state = getMockState();
    if (state.users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return fail('Email sudah terdaftar');
    }
    const user = {
      id: nextId('usr'),
      name: body.email.split('@')[0],
      email: body.email,
      password: body.password,
      role: 'CUSTOMER' as const,
      createdAt: new Date().toISOString(),
    };
    state.users.push(user);
    setMockState(state);
    return ok({ user: { id: user.id, email: user.email, role: user.role } }, 201);
  },

  registerAdmin: async (body: { email: string; password: string }) => {
    await requireUser(['ADMIN']);
    return mockHandlers.registerCustomer(body);
  },

  getAllUsers: async () => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    return ok(
      state.users.map(({ password: _p, ...u }) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      }))
    );
  },

  listProducts: (params?: Record<string, unknown>) => {
    const state = getMockState();
    const filtered = filterProducts(state.products, params).map(enrichProduct);
    return ok(paginate(filtered, params));
  },

  listCatalog: () => {
    const state = getMockState();
    return ok({
      products: state.products.filter((p) => p.isActive).map(enrichProduct),
      categories: state.categories.filter((c) => c.isActive),
    });
  },

  getProductBySlug: (slug: string) => {
    const product = getMockState().products.find((p) => p.slug === slug && p.isActive);
    if (!product) return fail('Product not found', 404);
    return ok(enrichProduct(product));
  },

  createProduct: async (body: Record<string, unknown>) => {
    await requireUser(['ADMIN']);
    const state = getMockState();

    if (body.type === 'SKU') {
      const product = state.products.find((p) => p.id === String(body.productId));
      if (!product) return fail('Product not found', 404);
      const sku = {
        id: nextId('sku'),
        productId: product.id,
        color: String(body.color),
        colorHex: String(body.colorHex ?? '#888888'),
        size: Number(body.size),
        stock: Number(body.stock ?? body.initialStock ?? 0),
        price: body.price ? Number(body.price) : undefined,
      };
      product.skus.push(sku);
      setMockState(state);
      return ok(sku, 201);
    }

    const category = state.categories.find((c) => c.id === String(body.categoryId));
    if (!category) return fail('Category not found');

    const product: MockProductRecord = {
      id: nextId('prod'),
      categoryId: category.id,
      name: String(body.name),
      slug: String(body.slug),
      description: String(body.description ?? ''),
      basePrice: Number(body.basePrice),
      imageUrl: body.imageUrl ? String(body.imageUrl) : undefined,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category,
      images: body.imageUrl ? [String(body.imageUrl)] : [],
      skus: [],
    };
    state.products.unshift(product);
    setMockState(state);
    return ok(product, 201);
  },

  updateProduct: async (id: string, body: Record<string, unknown>) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    const product = state.products.find((p) => p.id === id);
    if (!product) return fail('Product not found', 404);
    if (body.name) product.name = String(body.name);
    if (body.description !== undefined) product.description = String(body.description);
    if (body.basePrice !== undefined) product.basePrice = Number(body.basePrice);
    if (body.isActive !== undefined) product.isActive = Boolean(body.isActive);
    if (body.categoryId) {
      product.categoryId = String(body.categoryId);
      product.category = state.categories.find((c) => c.id === product.categoryId) ?? product.category;
    }
    product.updatedAt = new Date().toISOString();
    setMockState(state);
    return ok(enrichProduct(product));
  },

  updateSku: async (id: string, body: Record<string, unknown>) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    for (const product of state.products) {
      const sku = product.skus.find((s) => s.id === id);
      if (!sku) continue;
      if (body.color) sku.color = String(body.color);
      if (body.colorHex) sku.colorHex = String(body.colorHex);
      if (body.size) sku.size = Number(body.size);
      if (body.stock !== undefined) sku.stock = Number(body.stock);
      if (body.price !== undefined) sku.price = Number(body.price);
      setMockState(state);
      return ok(sku);
    }
    return fail('SKU not found', 404);
  },

  updateStock: async (skuId: string, body: { stock: number }) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    for (const product of state.products) {
      const sku = product.skus.find((s) => s.id === skuId);
      if (!sku) continue;
      sku.stock = Number(body.stock);
      setMockState(state);
      return ok({ skuId, stock: sku.stock });
    }
    return fail('SKU not found', 404);
  },

  uploadProductImage: async (id: string) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    const product = state.products.find((p) => p.id === id);
    if (!product) return fail('Product not found', 404);
    const url = `https://placehold.co/600x600/1a1a24/f97316?text=${encodeURIComponent(product.name)}`;
    product.imageUrl = url;
    product.images = [url];
    setMockState(state);
    return ok({ imageUrl: url });
  },

  listCategories: (params?: Record<string, unknown>) => {
    const items = getMockState().categories.filter((c) => c.isActive);
    return ok(paginate(items, params));
  },

  getCategory: (id: string) => {
    const cat = getMockState().categories.find((c) => c.id === id);
    if (!cat) return fail('Category not found', 404);
    return ok(cat);
  },

  createCategory: async (body: { name: string; slug: string }) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    if (state.categories.some((c) => c.slug === body.slug)) return fail('Slug sudah ada');
    const cat = {
      id: nextId('cat'),
      name: body.name,
      slug: body.slug,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.categories.push(cat);
    setMockState(state);
    return ok(cat, 201);
  },

  updateCategory: async (id: string, body: Record<string, unknown>) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    const cat = state.categories.find((c) => c.id === id);
    if (!cat) return fail('Category not found', 404);
    if (body.name) cat.name = String(body.name);
    if (body.slug) cat.slug = String(body.slug);
    cat.updatedAt = new Date().toISOString();
    setMockState(state);
    return ok(cat);
  },

  deleteCategory: async (id: string) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    const idx = state.categories.findIndex((c) => c.id === id);
    if (idx < 0) return fail('Category not found', 404);
    state.categories.splice(idx, 1);
    setMockState(state);
    return ok({ success: true });
  },

  checkout: async (body: Record<string, unknown>) => {
    const user = await requireUser(['CUSTOMER']);
    const state = getMockState();
    const lines = body.items as Array<{ skuId: string; quantity: number }>;
    if (!lines?.length) return fail('items is required');

    try {
      const { orderItems, subtotal } = buildOrderItems(lines);
      const shippingType = body.shippingType as 'DELIVERY' | 'PICKUP';
      const district = body.district ? String(body.district) : undefined;
      const shippingFee =
        shippingType === 'DELIVERY' ? SHIPPING_FEES[district ?? 'LOWOKWARU'] ?? 10000 : 0;

      for (const line of lines) {
        const sku = state.products.flatMap((p) => p.skus).find((s) => s.id === line.skuId)!;
        sku.stock -= line.quantity;
      }

      const orderId = nextId('ord');
      const now = new Date();
      const order: MockOrderRecord = {
        id: orderId,
        userId: user.id,
        status: 'PENDING',
        shippingType,
        district,
        shippingAddress: body.shippingAddress ? String(body.shippingAddress) : undefined,
        shippingFee,
        subtotal,
        total: subtotal + shippingFee,
        paymentMethod: String(body.paymentMethod ?? 'MANUAL_TRANSFER'),
        paymentExpiresAt: new Date(now.getTime() + 3600000).toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        user: { id: user.id, email: user.email, name: user.name },
        items: orderItems.map((i) => ({ ...i, orderId })),
      };
      state.orders.unshift(order);
      setMockState(state);
      return ok(order, 201);
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : 'Checkout failed');
    }
  },

  listMyOrders: async (params?: Record<string, unknown>) => {
    const user = await requireUser();
    let orders = getMockState().orders.filter((o) => o.userId === user.id);
    if (params?.status) orders = orders.filter((o) => o.status === params.status);
    return ok(paginate(orders, params));
  },

  listAllOrders: async (params?: Record<string, unknown>) => {
    await requireUser(['ADMIN']);
    let orders = [...getMockState().orders];
    if (params?.status) orders = orders.filter((o) => o.status === params.status);
    return ok(paginate(orders, params));
  },

  getOrder: async (id: string) => {
    const user = await requireUser();
    const order = getMockState().orders.find((o) => o.id === id);
    if (!order) return fail('Order not found', 404);
    if (user.role !== 'ADMIN' && order.userId !== user.id) return fail('Forbidden', 403);
    return ok(order);
  },

  uploadPaymentProof: async (orderId: string) => {
    const user = await requireUser();
    const state = getMockState();
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return fail('Order not found', 404);
    if (order.userId !== user.id) return fail('Forbidden', 403);
    if (order.status !== 'PENDING') return fail('Only PENDING orders can upload payment proof');
    order.paymentProofUrl = `https://placehold.co/400x600/16a34a/ffffff?text=Bukti+${orderId.slice(-6)}`;
    order.paymentProofUploadedAt = new Date().toISOString();
    order.status = 'WAITING_CONFIRMATION';
    order.updatedAt = new Date().toISOString();
    setMockState(state);
    return ok(order);
  },

  updateOrderStatus: async (id: string, body: { status: string }) => {
    await requireUser(['ADMIN']);
    const state = getMockState();
    const order = state.orders.find((o) => o.id === id);
    if (!order) return fail('Order not found', 404);
    order.status = body.status;
    order.updatedAt = new Date().toISOString();
    if (body.status === 'CANCELLED') {
      for (const item of order.items) {
        const sku = state.products.flatMap((p) => p.skus).find((s) => s.id === item.skuId);
        if (sku) sku.stock += item.quantity;
      }
    }
    setMockState(state);
    return ok(order);
  },

  deleteOrder: async (id: string) => {
    const user = await requireUser();
    const state = getMockState();
    const order = state.orders.find((o) => o.id === id);
    if (!order) return fail('Order not found', 404);
    if (user.role !== 'ADMIN' && order.userId !== user.id) return fail('Forbidden', 403);
    if (order.status !== 'PENDING') return fail('Order hanya bisa dibatalkan saat status PENDING');
    order.status = 'CANCELLED';
    for (const item of order.items) {
      const sku = state.products.flatMap((p) => p.skus).find((s) => s.id === item.skuId);
      if (sku) sku.stock += item.quantity;
    }
    setMockState(state);
    return ok({ success: true, message: 'Order berhasil dibatalkan', data: order });
  },

  downloadReceipt: async (id: string) => {
    await requireUser();
    const blob = new Blob([`Struk Mock SneakerLocal\nOrder: ${id}`], { type: 'application/pdf' });
    return ok(blob);
  },
};
