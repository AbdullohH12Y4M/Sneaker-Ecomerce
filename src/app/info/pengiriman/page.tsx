'use client';

import Link from 'next/link';

export default function PengirimanPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Informasi Pengiriman</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Kami melayani pengiriman ke area Malang Raya.</p>
        <p>Flat ongkir Rp10.000 untuk Lowokwaru, Klojen, Blimbing, Sukun, Kedungkandang.</p>
        <p>Opsi pengambilan sendiri (PICKUP) tersedia.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
