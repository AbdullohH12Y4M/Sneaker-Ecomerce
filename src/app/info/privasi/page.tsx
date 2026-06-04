'use client';

import Link from 'next/link';

export default function PrivasiPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Kebijakan Privasi</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Kami hanya mengumpulkan data yang diperlukan untuk proses pemesanan dan pengiriman.</p>
        <p>Data login disimpan menggunakan NextAuth. Keranjang disimpan di localStorage.</p>
        <p>Kami tidak menjual data pribadi Anda ke pihak ketiga.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
