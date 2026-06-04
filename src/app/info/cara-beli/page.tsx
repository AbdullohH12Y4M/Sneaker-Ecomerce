'use client';

import Link from 'next/link';

export default function CaraBeliPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Cara Beli</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>1. Pilih produk dan varian (warna + ukuran).</p>
        <p>2. Masukkan ke keranjang, lalu buka halaman Keranjang.</p>
        <p>3. Lanjut ke Checkout, pilih tipe pengiriman, lalu buat pesanan.</p>
        <p>4. Upload bukti pembayaran untuk menyelesaikan pesanan.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
