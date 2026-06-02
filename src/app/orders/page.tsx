'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ordersApi } from '@/lib/api';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatPrice } from '@/lib/utils';
import styles from './page.module.css';

interface OrderItem {
  id: string;
  orderId: string;
  skuId: string;
  quantity: number;
  priceAtPurchase: number;
  sku: {
    id: string;
    productId: string;
    color: string;
    size: string;
    price: number;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      description: string;
      category: string;
      images: string[];
      createdAt: string;
      updatedAt: string;
    };
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  shippingType: string;
  district?: string;
  shippingAddress?: string;
  shippingFee?: number;
  paymentProofUrl?: string;
  paymentExpiresAt?: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingOrder, setUploadingOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersApi.getMyOrders();
        setOrders(Array.isArray(response.data) ? response.data : response.data.items || []);
        setError('');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal mengambil data pesanan');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  const handleUpload = async (orderId: string, file: File) => {
    setUploadingOrder(orderId);
    try {
      await ordersApi.uploadProof(orderId, file);
      // Refresh orders after successful upload
      const response = await ordersApi.getMyOrders();
      setOrders(Array.isArray(response.data) ? response.data : response.data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setUploadingOrder(null);
    }
  };

  if (!session) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className={styles.emptyState}>
          <p>Silakan login untuk melihat pesanan Anda.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.ordersHeader}>
        <div>
          <p className="sectionLabel">Riwayat Pesanan</p>
          <h1 className="sectionTitle">Status pesanan dan bukti pembayaran</h1>
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>
          <p>Memuat pesanan...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <p className="form-error">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Tidak ada pesanan.</p>
          <p>Tambah barang ke keranjang, kemudian lakukan checkout.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <section className="card" key={order.id} style={{ padding: '24px' }}>
              <div className={styles.orderHeader}>
                <div>
                  <p className="text-muted">Pesanan #{order.id}</p>
                  <h2>{ORDER_STATUS_LABELS[order.status] ?? order.status}</h2>
                </div>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.orderGrid}>
                <div>
                  <p className="font-medium">Tipe Pengiriman</p>
                  <p className="text-muted">{order.shippingType}</p>
                </div>
                <div>
                  <p className="font-medium">Lokasi</p>
                  <p className="text-muted">{order.shippingAddress || order.district || 'Pengambilan'}</p>
                </div>
                <div>
                  <p className="font-medium">Total</p>
                  <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                </div>
                <div>
                  <p className="font-medium">Tanggal</p>
                  <p className="text-muted">{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className={styles.itemsHeader}>
                <span>Item</span>
                <span>Jumlah</span>
                <span>Subtotal</span>
              </div>
              {order.items.map((item) => (
                <div className={styles.orderItem} key={item.id}>
                  <div>
                    <p className="font-medium">{item.sku.product.name}</p>
                    <p className="text-muted">{item.sku.color} • EU {item.sku.size}</p>
                  </div>
                  <span>{item.quantity}</span>
                  <span>{formatPrice(item.priceAtPurchase * item.quantity)}</span>
                </div>
              ))}

              {(order.status === 'PENDING' || order.status === 'WAITING_CONFIRMATION') && (
                <div className={styles.paymentBox}>
                  {order.paymentProofUrl ? (
                    <div>
                      <p className="font-medium">Bukti Transfer</p>
                      <a href={order.paymentProofUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        Lihat Bukti
                      </a>
                    </div>
                  ) : (
                    <label className="btn btn-primary btn-sm" htmlFor={`proof-${order.id}`}>
                      {uploadingOrder === order.id ? 'Mengunggah...' : 'Unggah Bukti Transfer'}
                      <input
                        id={`proof-${order.id}`}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) handleUpload(order.id, file);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
