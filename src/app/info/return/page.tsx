'use client';

import Link from 'next/link';

export default function ReturnPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Return & Garansi</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Produk dapat dikembalikan apabila tidak sesuai deskripsi atau mengalami cacat produksi.</p>
        <p>Harap hubungi tim kami sebelum mengajukan return untuk panduan lebih lanjut.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
