import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import type { NextAuthConfig } from 'next-auth';
import { authApi } from './api';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await authApi.login({
            email: credentials.email,
            password: credentials.password,
          });

          const data = res.data;
          // Memastikan data sesuai dengan response asli backend: data.access_token & data.user
          if (data?.access_token && data?.user) {
            return {
              id: data.user.id,
              // Fallback karena backend tidak mengirimkan field 'name'
              name: data.user.name || data.user.email.split('@')[0], 
              email: data.user.email,
              role: data.user.role || 'CUSTOMER',
              accessToken: data.access_token,
            };
          }
          return null;
        } catch (error: any) {
          // === INSTRUMEN PENGUJIAN BARU ===
          console.error('❌ [Auth-Authorize] Terjadi kegagalan saat hit API login backend:');
          if (error.response) {
            // Backend merespons tetapi dengan status kode di luar 2xx (e.g., 400, 401)
            console.error('Status Code dari BE:', error.response.status);
            console.error('Pesan Eror dari BE:', error.response.data);
          } else if (error.request) {
            // Request dikirim tetapi tidak ada respons sama sekali (e.g., Network timeout/Railway cold start)
            console.error('Tidak ada respons dari backend. Periksa koneksi jaringan atau apakah server Railway mati/sleep.');
          } else {
            console.error('Eror konfigurasi request:', error.message);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'CUSTOMER';
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 hari
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);