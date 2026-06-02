import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { Providers } from '@/components/providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SneakerLocal — Sepatu Keren, Harga Mahasiswa',
    template: '%s | SneakerLocal',
  },
  description:
    'Belanja sepatu sneakers, kasual, dan formal terbaik dengan harga terjangkau khusus mahasiswa Malang. Gratis ongkir area Malang Raya.',
  keywords: ['sepatu', 'sneakers', 'malang', 'mahasiswa', 'murah', 'lokal'],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'SneakerLocal',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="id">
      <body>
        <Providers session={session}>
          <div className="page-wrapper">
            <Navbar />
            <main className="page-main">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
