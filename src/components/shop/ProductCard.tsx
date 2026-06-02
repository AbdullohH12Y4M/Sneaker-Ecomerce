'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const uniqueColors = [...new Set(product.skus.map((s) => s.color))];
  const totalStock = product.skus.reduce((sum, s) => sum + s.stock, 0);
  const isOutOfStock = totalStock === 0;

  const displayImage =
    !imgError && product.images?.[0]
      ? product.images[0]
      : `https://placehold.co/400x400/1a1a24/f97316?text=${encodeURIComponent(product.name.slice(0, 8))}`;

  return (
    <motion.div
      className={`${styles.card} ${isOutOfStock ? styles.outOfStock : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <Link href={`/products/${product.slug}`} className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={product.name}
          className={styles.image}
          onError={() => setImgError(true)}
        />
        {isOutOfStock && (
          <div className={styles.soldOutBadge}>Habis</div>
        )}
        <div className={styles.overlay}>
          <span className={styles.overlayText}>Lihat Detail</span>
        </div>
      </Link>

      {/* Wishlist */}
      <button
        className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
        onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
        aria-label="Tambah ke wishlist"
      >
        <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
      </button>

      {/* Info */}
      <div className={styles.info}>
        {/* Color swatches */}
        <div className={styles.swatches}>
          {uniqueColors.slice(0, 5).map((color) => {
            const sku = product.skus.find((s) => s.color === color);
            return (
              <span
                key={color}
                className={styles.swatch}
                style={{ background: sku?.colorHex || '#888' }}
                title={color}
              />
            );
          })}
          {uniqueColors.length > 5 && (
            <span className={styles.swatchMore}>+{uniqueColors.length - 5}</span>
          )}
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className={styles.name}>{product.name}</h3>
        </Link>

        <div className={styles.footer}>
          <span className={`price ${styles.price}`}>{formatPrice(product.basePrice)}</span>
          {!isOutOfStock && (
            <Link
              href={`/products/${product.slug}`}
              className={`btn btn-primary btn-sm ${styles.addBtn}`}
            >
              <ShoppingBag size={14} />
              Beli
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
