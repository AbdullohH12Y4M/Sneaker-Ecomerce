'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api';
import { parseProductsList } from '@/lib/api-helpers';
import { formatPrice, extractErrorMessage } from '@/lib/utils';
import type { Product, ProductSKU, Category } from '@/types';
import styles from './page.module.css';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSkuForm, setShowSkuForm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [productForm, setProductForm] = useState({
    categoryId: '',
    name: '',
    slug: '',
    description: '',
    basePrice: '',
    imageUrl: '',
    isActive: true,
  });

  const [skuForm, setSkuForm] = useState({
    color: '',
    colorHex: '#888888',
    size: '',
    stock: '',
    price: '',
  });
  const [skuImageFile, setSkuImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll({ limit: 100 });
      setProducts(parseProductsList(response.data));
      setError('');
    } catch (err: any) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.listAll();
      setCategories((res.data as Category[]) || []);
    } catch {
      // silent
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.categoryId || !productForm.name || !productForm.slug || !productForm.description || !productForm.basePrice) {
      alert('Lengkapi semua field wajib.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        type: 'PRODUCT',
        categoryId: productForm.categoryId,
        name: productForm.name,
        slug: productForm.slug,
        description: productForm.description,
        basePrice: Number(productForm.basePrice),
        isActive: productForm.isActive,
      };
      if (productForm.imageUrl) payload.imageUrl = productForm.imageUrl;

      const res = await productsApi.create(payload);
      const newId = res?.data?.id;

      if (newId && productImageFile) {
        await productsApi.uploadImage(newId, productImageFile);
      }

      setShowCreateForm(false);
      setProductImageFile(null);
      setProductForm({ categoryId: '', name: '', slug: '', description: '', basePrice: '', imageUrl: '', isActive: true });
      fetchProducts();

      if (newId) {
        router.push(`/admin/products/${newId}/edit`);
      }
    } catch (err: any) {
      alert('Gagal membuat produk: ' + extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSku = async (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    if (!skuForm.color || !skuForm.size || skuForm.stock === '') {
      alert('Warna, ukuran, dan stok wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        type: 'SKU',
        productId,
        color: skuForm.color,
        colorHex: skuForm.colorHex,
        size: Number(skuForm.size),
        stock: Number(skuForm.stock),
      };
      if (skuForm.price) payload.price = Number(skuForm.price);

      await productsApi.create(payload);
      setShowSkuForm(null);
      setSkuForm({ color: '', colorHex: '#888888', size: '', stock: '', price: '' });
      fetchProducts();
    } catch (err: any) {
      alert('Gagal membuat SKU: ' + extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Hapus produk beserta seluruh varian dan stok?')) return;
    try {
      await productsApi.updateProduct(id, { isActive: false });
      fetchProducts();
    } catch (err: any) {
      alert('Gagal menghapus produk: ' + extractErrorMessage(err));
    }
  };

  const slugify = (val: string) =>
    val.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2>Manajemen Produk</h2>
        <button className="btn btn-primary" onClick={() => { setShowCreateForm((v) => !v); setShowSkuForm(null); }}>
          {showCreateForm ? 'Batal' : '+ Tambah Produk'}
        </button>
      </div>

      {error && <p className="form-error" style={{ marginBottom: '16px' }}>{error}</p>}

      {showCreateForm && (
        <form onSubmit={handleCreateProduct} className="card" style={{ padding: '24px', marginBottom: '24px', display: 'grid', gap: '16px' }}>
          <h3>Tambah Produk Baru</h3>
          <div>
            <label className="form-label">Kategori *</label>
            <select
              className="form-select"
              value={productForm.categoryId}
              onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
              required
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Nama Produk *</label>
              <input className="form-input" value={productForm.name} onChange={(e) => {
                const v = e.target.value;
                setProductForm({ ...productForm, name: v });
                if (!productForm.slug) setProductForm((p) => ({ ...p, slug: slugify(v) }));
              }} required />
            </div>
            <div>
              <label className="form-label">Slug *</label>
              <input className="form-input" value={productForm.slug} onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="form-label">Deskripsi *</label>
            <textarea className="form-textarea form-input" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="form-label">Harga Dasar *</label>
              <input type="number" className="form-input" value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })} required />
            </div>
            <div>
              <label className="form-label">URL Gambar (opsional)</label>
              <input className="form-input" value={productForm.imageUrl} onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })} />
            </div>
            <div>
              <label className="form-label">Upload Gambar (opsional)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={(e) => setProductImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input id="isActive" type="checkbox" checked={productForm.isActive} onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })} />
            <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>Aktif</label>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan Produk'}</button>
        </form>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Memuat data produk...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Tidak ada produk.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>ID</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Nama</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Kategori</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Harga</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Varian</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <>
                  <tr key={product.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '16px', fontSize: '0.85rem' }}>...{product.id.substring(product.id.length - 8)}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '16px' }}><span className="badge badge-info">{product.category}</span></td>
                    <td style={{ padding: '16px' }}>{formatPrice(product.basePrice)}</td>
                    <td style={{ padding: '16px' }}>{product.skus?.length || 0} SKU</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => router.push(`/admin/products/${product.id}/edit`)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: 'var(--color-danger)', color: '#fff' }} onClick={() => handleDeleteProduct(product.id)}>Hapus</button>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowSkuForm(showSkuForm === product.id ? null : product.id)}>
                          + SKU
                        </button>
                      </div>
                    </td>
                  </tr>
                  {showSkuForm === product.id && (
                    <tr key={`${product.id}-sku`} style={{ background: 'var(--color-surface-2)' }}>
                      <td colSpan={6} style={{ padding: '24px' }}>
                        <form onSubmit={(e) => handleCreateSku(e, product.id)} className="card" style={{ padding: '20px', display: 'grid', gap: '12px', maxWidth: '600px' }}>
                          <h4>Tambah Varian SKU untuk {product.name}</h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div>
                              <label className="form-label">Warna *</label>
                              <input className="form-input" value={skuForm.color} onChange={(e) => setSkuForm({ ...skuForm, color: e.target.value })} required />
                            </div>
                            <div>
                              <label className="form-label">Kode Warna (Hex) *</label>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="color" value={skuForm.colorHex} onChange={(e) => setSkuForm({ ...skuForm, colorHex: e.target.value })} style={{ width: '40px', height: '40px', border: 'none' }} />
                                <input className="form-input" value={skuForm.colorHex} onChange={(e) => setSkuForm({ ...skuForm, colorHex: e.target.value })} required style={{ flex: 1 }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            <div>
                              <label className="form-label">Ukuran *</label>
                              <input type="number" className="form-input" value={skuForm.size} onChange={(e) => setSkuForm({ ...skuForm, size: e.target.value })} required />
                            </div>
                            <div>
                              <label className="form-label">Stok *</label>
                              <input type="number" className="form-input" value={skuForm.stock} onChange={(e) => setSkuForm({ ...skuForm, stock: e.target.value })} min="0" required />
                            </div>
                            <div>
                              <label className="form-label">Harga (opsional)</label>
                              <input type="number" className="form-input" value={skuForm.price} onChange={(e) => setSkuForm({ ...skuForm, price: e.target.value })} placeholder="Override" />
                            </div>
                          </div>
                          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Menyimpan...' : 'Tambah SKU'}</button>
                        </form>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
