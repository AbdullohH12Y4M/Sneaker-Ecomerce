import type { Order, Product } from '@/types';
import { ordersApi, productsApi } from './api';
import { isMockApiEnabled } from './mock-api/config';

/** Ambil array dari berbagai bentuk respons paginasi BE. */
export function parseListPayload<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.products)) return obj.products as T[];
  }
  return [];
}

export function normalizeProductCategory(category: unknown): string {
  if (typeof category === 'string') return category;
  if (category && typeof category === 'object') {
    const c = category as { name?: string; slug?: string };
    return c.name ?? c.slug ?? 'Uncategorized';
  }
  return 'Uncategorized';
}

export function normalizeProduct(product: Record<string, unknown>): Product {
  const rawSkus = (product.skus as Record<string, unknown>[]) || [];
  const skus = rawSkus.map((sku) => ({
    ...sku,
    stock:
      (sku.stock as number) ??
      ((sku.inventory as { stock?: number } | undefined)?.stock ?? 0),
  })) as Product['skus'];

  const images = Array.isArray(product.images) && product.images.length
    ? (product.images as string[])
    : product.imageUrl
      ? [String(product.imageUrl)]
      : ['/placeholder-shoes.png'];

  const category = product.category as { id?: string } | string | undefined;

  return {
    ...(product as unknown as Product),
    category: normalizeProductCategory(category),
    images,
    skus,
  };
}

export function normalizeOrderItem(item: Record<string, unknown>) {
  const unitPrice = (item.priceAtPurchase as number) ?? (item.price as number) ?? 0;
  const sku = item.sku as Record<string, unknown> | undefined;

  return {
    ...item,
    priceAtPurchase: unitPrice,
    sku: sku
      ? {
          ...sku,
          product: sku.product
            ? normalizeProduct(sku.product as Record<string, unknown>)
            : sku.product,
        }
      : sku,
  };
}

export function normalizeOrder(order: Record<string, unknown>): Order {
  const items = ((order.items as Record<string, unknown>[]) || []).map((item) =>
    normalizeOrderItem(item)
  );

  const shippingFee =
    (order.shippingFee as number) ?? (order.shippingCost as number) ?? 0;

  return {
    ...(order as unknown as Order),
    items: items as Order['items'],
    totalPrice: (order.totalPrice as number) ?? (order.total as number) ?? 0,
    shippingCost: shippingFee,
    shippingDistrict:
      (order.shippingDistrict as string) ?? (order.district as string),
    paymentDeadline:
      (order.paymentDeadline as string) ?? (order.paymentExpiresAt as string),
  };
}

export function parseOrdersList(data: unknown): Order[] {
  return parseListPayload<Record<string, unknown>>(data).map(normalizeOrder);
}

export function parseProductsList(data: unknown): Product[] {
  return parseListPayload<Record<string, unknown>>(data).map(normalizeProduct);
}

/** Unduh struk PDF ke perangkat pengguna. */
export async function downloadOrderReceipt(orderId: string): Promise<void> {
  const res = await ordersApi.downloadReceipt(orderId);
  const blob =
    res.data instanceof Blob
      ? res.data
      : new Blob([res.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `struk-${orderId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Muat produk admin beserta SKU (detail per slug).
 * GET /products tidak menyertakan SKU; ini solusi FE tanpa ubah BE.
 */
export async function fetchAdminProductsWithSkus(): Promise<Product[]> {
  const listRes = await productsApi.getAll({ limit: 100 });
  const base = parseProductsList(listRes.data);

  if (isMockApiEnabled()) {
    return base;
  }

  return Promise.all(
    base.map(async (product) => {
      if (product.skus?.length) return product;
      if (!product.slug) return product;
      try {
        const detailRes = await productsApi.getBySlug(product.slug);
        return normalizeProduct(detailRes.data as Record<string, unknown>);
      } catch {
        return product;
      }
    })
  );
}
