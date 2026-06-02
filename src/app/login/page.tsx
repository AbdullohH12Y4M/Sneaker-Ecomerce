'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import styles from './page.module.css';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (session) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <div className={styles.loggedIn}>
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
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setMessage('Email atau password salah.');
    } else if (result?.ok) {
      // Store token in localStorage if provided
      try {
        const loginRes = await authApi.login({ email, password });
        if (loginRes.data?.access_token) {
          localStorage.setItem('access_token', loginRes.data.access_token);
        }
      } catch {
        // Token should be handled by NextAuth session
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
      const response = await authApi.register({ name, email, password });
      if (response?.data?.success || response?.status === 201) {
        setMessage('Akun berhasil dibuat. Silakan login.');
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsRegister(false);
      } else {
        setMessage(response?.data?.message || 'Registrasi gagal. Coba lagi.');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Tidak dapat terhubung ke server pendaftaran.';
      setMessage(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className={styles.loginGrid}>
        <div className={styles.introCard}>
          <h1>{isRegister ? 'Daftar Akun Baru' : 'Masuk ke SneakerLocal'}</h1>
          <p>Login cepat dengan email & password, atau gunakan Google untuk akses cepat.</p>
          <button className="btn btn-secondary btn-full" type="button" onClick={() => signIn('google')}>
            Masuk dengan Google
          </button>
          <p className="text-muted">Akun Google akan tersinkron dengan role CUSTOMER secara otomatis.</p>
        </div>

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

          {isRegister && (
            <div className={styles.fieldGroup}>
              <label className="form-label" htmlFor="name">Nama Lengkap</label>
              <input
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
              />
            </div>
          )}

          <div className={styles.fieldGroup}>
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kampus.ac.id"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>

          {isRegister && (
            <div className={styles.fieldGroup}>
              <label className="form-label" htmlFor="confirmPassword">Konfirmasi Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
              />
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={isRegister ? handleRegister : handleCredentialsSignIn}
            disabled={loading}
          >
            {isRegister ? 'Daftar Akun' : 'Masuk'}
          </button>

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
