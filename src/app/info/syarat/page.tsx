'use client';

import Link from 'next/link';

export default function SyaratPage() {
  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <h1>Syarat & Ketentuan</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <p>Dengan menggunakan layanan ini, Anda setuju untuk memberikan informasi yang akurat saat checkout.</p>
        <p>Pembayaran harus dilakukan sesuai nominal dan batas waktu yang tercantum.</p>
        <p>SneakerLocal berhak menolak/membatalkan pesanan jika terjadi kecurangan.</p>
      </div>
      <Link href="/" className="btn btn-secondary" style={{ marginTop: 20 }}>Kembali ke Beranda</Link>
    </div>
  );
}
