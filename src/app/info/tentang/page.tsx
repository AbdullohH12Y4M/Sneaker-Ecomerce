'use client';

import Link from 'next/link';

export default function TentangPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Tentang Kami</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>SneakerLocal adalah toko sepatu lokal Malang yang menyediakan sneakers, kasual, formal, sandal, dan boots.</p>
        <p>Kami berfokus pada kualitas, varian ukuran/warna, dan harga ramah mahasiswa.</p>
        <p>Dibuat dengan ❤️ di Malang.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
