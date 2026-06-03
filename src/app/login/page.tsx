'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api'; // Mengacu pada berkas api.ts kamu
import { extractErrorMessage } from '@/lib/utils';
import styles from './page.module.css';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Jika session ada, tampilkan pesan selamat datang
  if (session) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className={styles.loggedIn}>
          {/* Menggunakan session.user.name (yang sudah difallback ke email di auth.ts) */}
          <h1>Selamat datang, {session.user?.name}</h1>
          <p>Anda sudah masuk. Lanjutkan belanja atau lihat riwayat pesanan Anda.</p>
          <div className={styles.loggedInActions}>
            <button className="btn btn-primary" onClick={() => router.push('/')}>Beranda</button>
            <button className="btn btn-secondary" onClick={() => router.push('/orders')}>Pesanan Saya</button>
          </div>
        </div>
      </div>
    );
  }

  const handleCredentialsSignIn = async () => {
    setLoading(true);
    setMessage('');
    
    // 1. Proses autentikasi melalui NextAuth Credentials provider
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setMessage('Email atau password salah.');
    } else if (result?.ok) {
      // 2. Ambil token langsung dari backend untuk disimpan di localStorage (untuk kebutuhan Axios Interceptor)
      try {
        const loginRes = await authApi.login({ email, password });
        if (loginRes.data?.access_token) {
          localStorage.setItem('access_token', loginRes.data.access_token);
        }
      } catch {
        // Fallback aman jika penyimpanan localStorage menemui kendala
      }
      router.push('/');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
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
      // PERBAIKAN: Menggunakan 'registerCustomer' sesuai dengan isi lib/api.ts
      // Menghapus properti 'name' karena tidak didukung oleh skema backend
      const response = await authApi.registerCustomer({ email, password });
      
      if (response?.status === 201 || response?.data?.user) {
        setMessage('Akun berhasil dibuat. Silakan login.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsRegister(false);
      } else {
        setMessage(response?.data?.message || 'Registrasi gagal. Coba lagi.');
      }
    } catch (error: any) {
      setMessage(extractErrorMessage(error));
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.loginGrid}>
        <div className={styles.formCard}>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!isRegister ? styles.toggleActive : ''}`}
              onClick={() => setIsRegister(false)}
            >
              Masuk
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${isRegister ? styles.toggleActive : ''}`}
              onClick={() => setIsRegister(true)}
            >
              Daftar
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              isRegister ? handleRegister() : handleCredentialsSignIn();
            }}
          >
            {/* Input Nama Lengkap ditiadakan karena backend registrasi tidak menyimpannya */}

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
              {isRegister && password.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: password.length >= 6 ? 'var(--color-success)' : 'var(--color-danger)' }} />
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: password.length >= 6 && (password.match(/[0-9]/) || password.match(/[^a-zA-Z0-9]/)) ? 'var(--color-success)' : 'var(--color-surface-3)' }} />
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: password.length >= 8 && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/) ? 'var(--color-success)' : 'var(--color-surface-3)' }} />
                </div>
              )}
            </div>

            {isRegister && (
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
                    required={isRegister}
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
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {isRegister ? 'Daftar Akun' : 'Masuk'}
            </button>
          </form>

          {message && (
            <p className={message.includes('berhasil') ? 'form-text hint text-success' : 'form-error'}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}