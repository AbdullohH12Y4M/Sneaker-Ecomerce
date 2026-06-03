'use client';

import { useEffect, useState } from 'react';
import { productsApi } from '@/lib/api';
import { formatPrice, extractErrorMessage } from '@/lib/utils';
import { Product } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin form state (type=PRODUCT)
  const [isCreating, setIsCreating] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
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
      setError(extractErrorMessage(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedSlug = (slug || newProductName)
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!categoryId || !newProductName || !cleanedSlug || !description || !basePrice) {
      alert('Lengkapi field wajib: categoryId, name, slug, description, basePrice');
      return;
    }

    try {
      const payload = {
        type: 'PRODUCT',
        categoryId,
        name: newProductName,
        slug: cleanedSlug,
        description,
        basePrice: Number(basePrice),
        imageUrl: imageUrl || '',
        isActive: Boolean(isActive),
      };

      const response = await productsApi.create(payload as any);
      const newProductId = response?.data?.id;

      // chaining: upload image if backend returns ID and user selected a file
      if (newProductId && imageFile) {
        await productsApi.uploadImage(newProductId, imageFile);
      }

      // reset + refresh
      setCategoryId('');
      setNewProductName('');
      setSlug('');
      setDescription('');
      setBasePrice('');
      setImageUrl('');
      setIsActive(true);
      setImageFile(null);

      setIsCreating(false);
      fetchProducts();
    } catch (err: any) {
      alert('Gagal membuat produk: ' + extractErrorMessage(err));
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
        <form
          onSubmit={handleCreate}
          className="card"
          style={{ padding: '24px', marginBottom: '24px', display: 'grid', gap: '16px' }}
        >
          <h3>Tambah Produk Baru (type=PRODUCT)</h3>

          <div>
            <label className="form-label">categoryId (CUID) *</label>
            <input
              className="form-input"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Contoh: clxxxxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
          </div>

          <div>
            <label className="form-label">Name *</label>
            <input
              className="form-input"
              value={newProductName}
              onChange={(e) => {
                const v = e.target.value;
                setNewProductName(v);
                if (!slug) {
                  const nextSlug = v
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z0-9-]/g, '');
                  setSlug(nextSlug);
                }
              }}
              placeholder="Contoh: Nike Air Force 1"
              required
            />
          </div>

          <div>
            <label className="form-label">Slug *</label>
            <input
              className="form-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="contoh: nike-air-force-1"
              required
            />
          </div>

          <div>
            <label className="form-label">Description *</label>
            <input
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi produk"
              required
            />
          </div>

          <div>
            <label className="form-label">basePrice (angka) *</label>
            <input
              type="number"
              className="form-input"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="Contoh: 1500000"
              required
            />
          </div>

          <div>
            <label className="form-label">imageUrl (opsional)</label>
            <input
              className="form-input"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL image (atau kosongkan)"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              id="isActive"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label htmlFor="isActive" className="form-label" style={{ margin: 0 }}>
              isActive
            </label>
          </div>

          <div>
            <label className="form-label">Upload Gambar Produk (opsional) </label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={(e) => {
                setImageFile(e.target.files?.[0] ?? null);
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
            Simpan Produk
          </button>
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
