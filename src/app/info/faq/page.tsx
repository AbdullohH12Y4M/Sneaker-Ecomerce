'use client';

import Link from 'next/link';

export default function FaqPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>FAQ</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Q: Apakah stok tersedia realtime? A: Stok berkurang saat checkout.</p>
        <p>Q: Berapa lama pesanan kadaluarsa? A: 1 jam jika belum dibayar.</p>
        <p>Q: Apakah mendukung COD? A: Saat ini belum tersedia.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
