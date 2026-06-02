'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Basic MVP form state
  const [isCreating, setIsCreating] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll();
      setProducts(Array.isArray(response.data) ? response.data : response.data.items || []);
      setError('');
    } catch (err: any) {
      setError('Gagal mengambil data produk');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName || !newProductPrice) return;
    
    try {
      const formData = new FormData();
      formData.append('name', newProductName);
      formData.append('basePrice', newProductPrice);
      formData.append('category', 'SNEAKERS');
      formData.append('description', 'Deskripsi produk ' + newProductName);
      
      await productsApi.create(formData);
      setNewProductName('');
      setNewProductPrice('');
      setIsCreating(false);
      fetchProducts();
    } catch (err: any) {
      alert('Gagal membuat produk: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading && products.length === 0) {
    return <div className="card" style={{ padding: '24px', textAlign: 'center' }}>Memuat data produk...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Daftar Produk</h2>
        <button className="btn btn-primary" onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? 'Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

      {isCreating && (
        <form onSubmit={handleCreate} className="card" style={{ padding: '24px', marginBottom: '24px', display: 'grid', gap: '16px' }}>
          <h3>Tambah Produk Baru</h3>
          <div>
            <label className="form-label">Nama Produk</label>
            <input 
              className="form-input" 
              value={newProductName} 
              onChange={(e) => setNewProductName(e.target.value)} 
              placeholder="Contoh: Nike Air Force 1"
              required 
            />
          </div>
          <div>
            <label className="form-label">Harga Dasar</label>
            <input 
              type="number" 
              className="form-input" 
              value={newProductPrice} 
              onChange={(e) => setNewProductPrice(e.target.value)} 
              placeholder="Contoh: 1500000"
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>Simpan Produk</button>
        </form>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Tidak ada produk.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ID</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Nama Produk</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Kategori</th>
                  <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Harga</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>...{product.id.substring(product.id.length - 8)}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '16px' }}><span className="badge badge-info">{product.category}</span></td>
                    <td style={{ padding: '16px' }}>{formatPrice(product.basePrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
