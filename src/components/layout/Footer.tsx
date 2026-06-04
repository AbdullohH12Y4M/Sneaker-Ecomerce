import Link from 'next/link';
import styles from './Footer.module.css';

import { FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { MdLocationOn, MdEmail, MdOutlineSchedule } from 'react-icons/md';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <span>👟</span>
              <span className={styles.logoText}>
                Sneaker<span className={styles.accent}>Local</span>
              </span>
            </div>
            <p className={styles.tagline}>
              Sepatu keren, harga mahasiswa.<br />
              Pengiriman gratis area Malang Raya.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialBtn} aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
              <a href="#" className={styles.socialBtn} aria-label="WhatsApp">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className={styles.colTitle}>Kategori</h4>
            <ul className={styles.linkList}>
              {['Sneakers', 'Kasual', 'Formal', 'Sandal', 'Boots'].map((c) => (
                <li key={c}>
                  <Link href={`/?category=${c.toUpperCase()}`} className={styles.link}>{c}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Informasi</h4>
            <ul className={styles.linkList}>
              <li><Link href="/info/tentang" className={styles.link}>Tentang Kami</Link></li>
              <li><Link href="/info/cara-beli" className={styles.link}>Cara Beli</Link></li>
              <li><Link href="/info/pengiriman" className={styles.link}>Info Pengiriman</Link></li>
              <li><Link href="/info/return" className={styles.link}>Return & Garansi</Link></li>
              <li><Link href="/info/faq" className={styles.link}>FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={styles.colTitle}>Kontak</h4>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactIcon}>📍</span>
                <span>Lowokwaru, Malang, Jawa Timur</span>
              </li>
              <li>
                <span className={styles.contactIcon}></span>
                <a href="https://wa.me/628818846197" className={styles.link}>
                  Hisyam: 0881-8846-197
                </a>
              </li>
              <li>
                <span className={styles.contactIcon}></span>
                <a href="https://wa.me/6289696875146" className={styles.link}>
                  Althaf: 62 896-9687-5146
                </a>
              </li>
              <li>
                <span className={styles.contactIcon}>📧</span>
                <a href="mailto:halo@sneakerlocal.id" className={styles.link}>
                  halo@sneakerlocal.id
                </a>
              </li>
              <li>
                <span className={styles.contactIcon}>🕐</span>
                <span>Senin–Sabtu, 09.00–21.00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} SneakerLocal. Dibuat dengan ❤️ di Malang.
          </p>
          <div className={styles.bottomLinks}>
            <Link href="/info/privasi" className={styles.bottomLink}>Kebijakan Privasi</Link>
            <Link href="/info/syarat" className={styles.bottomLink}>Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
