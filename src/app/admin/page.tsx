'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ordersApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
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
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  shippingType: string;
  district?: string;
  shippingAddress?: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
}

const ORDER_STATUSES = ['PENDING', 'WAITING_CONFIRMATION', 'PAID', 'SHIPPED', 'CANCELLED'];

export default function AdminPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user || session.user.role !== 'ADMIN') {
      // keep effects pure: only update state via functional setters
      setLoading((_) => false);
      return;
    }


    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersApi.getMyOrders({ limit: 100 });
        setOrders(Array.isArray(response.data) ? response.data : response.data.items || []);
        setError('');
      } catch (err: any) {
        setError(extractErrorMessage(err));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [session]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setUpdating(null);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className="text-muted">Total Pesanan</p>
          <h2>{orders.length}</h2>
        </div>
        <div className={styles.statCard}>
          <p className="text-muted">Menunggu Verifikasi</p>
          <h2>{orders.filter((o) => o.status === 'WAITING_CONFIRMATION').length}</h2>
        </div>
        <div className={styles.statCard}>
          <p className="text-muted">Dalam Pengiriman</p>
          <h2>{orders.filter((o) => o.status === 'SHIPPED').length}</h2>
        </div>
      </div>

      {error && (
        <div className="card" style={{ padding: '16px', marginBottom: '24px' }}>
          <p className="form-error">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <p>Memuat data pesanan...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <p>Tidak ada pesanan.</p>
        </div>
      ) : (
        <section className={styles.cardSection}>
          <h2>Perbarui Status Pesanan</h2>
          <div className={styles.orderTable}>
            {orders.map((order) => (
              <div key={order.id} className={styles.orderRow} style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ flex: 1 }}>
                  <p className="font-medium">Pesanan #{order.id}</p>
                  <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                    {order.shippingType} • {order.items.length} item • {new Date(order.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className={styles.orderActions} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`btn btn-sm ${order.status === status ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => handleStatusUpdate(order.id, status)}
                      disabled={updating === order.id}
                      style={{ minWidth: '100px', whiteSpace: 'nowrap' }}
                    >
                      {updating === order.id ? '...' : status.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
