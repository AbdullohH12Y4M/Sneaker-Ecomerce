'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { extractErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

export default function RegisterPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (session) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className={styles.registerCard}>
          <h1>Anda sudah masuk</h1>
          <p>Anda sudah memiliki akun. Lanjutkan berbelanja atau kelola akun Anda.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => router.push('/')}>Beranda</button>
            <button className="btn btn-secondary" onClick={() => router.push('/orders')}>Pesanan Saya</button>
          </div>
        </div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi tidak cocok.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setMessage('Password minimal 6 karakter.');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.registerCustomer({ email, password });

      if (response?.status === 201 || response?.data?.user) {
        setMessage('Akun berhasil dibuat. Silakan login.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setMessage(response?.data?.message || 'Registrasi gagal. Coba lagi.');
      }
    } catch (error: any) {
      setMessage(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.registerGrid}>
        <div className={styles.registerCard}>
          <h1>Daftar Akun</h1>
          <p className="text-muted">Buat akun untuk mulai berbelanja di SneakerLocal.</p>

          <form onSubmit={handleRegister}>
            <div className={styles.fieldGroup}>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className="form-label" htmlFor="confirmPassword">Konfirmasi Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? 'Sembunyikan' : 'Lihat'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? 'Membuat Akun...' : 'Daftar'}
            </button>
          </form>

          {message && (
            <p className={message.includes('berhasil') ? 'form-text hint text-success' : 'form-error'}>
              {message}
            </p>
          )}

          <p className="text-muted">
            Sudah punya akun? <Link href="/login" className="btn btn-ghost btn-sm">Masuk</Link>
          </p>
        </div>

        <div className={styles.registerCard}>
          <h2>Keuntungan Bergabung</h2>
          <ul style={{ display: 'grid', gap: '12px', paddingLeft: '20px' }}>
            <li>Katalog sepatu lokal Malang terlengkap</li>
            <li>Varian warna dan ukuran lengkap</li>
            <li>Stok real-time dan harga transparan</li>
            <li>Ongkir flat ke seluruh Malang Raya</li>
            <li>Pembayaran aman dengan bukti transfer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
