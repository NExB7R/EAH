'use client'

import Link from 'next/link'
import WmImage from './wm-image'
import { StarIcon, MapPinIcon, ArrowLeftIcon } from './icons'
import type { Business } from '@/lib/data'
import styles from './featured-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Card (Hero + Small)
// ═══════════════════════════════════════════════════════════

type Props = {
  business: Business
  variant: 'hero' | 'small'
  priority?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أنشطة أخرى',
}

export default function FeaturedCard({ business, variant, priority }: Props) {
  const typeLabel = TYPE_LABELS[business.business_type] ?? 'نشاط'
  const rating = business.trust_score ? (business.trust_score / 20).toFixed(1) : null

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`${styles.card} ${styles[variant]}`}
      aria-label={business.name}
    >
      <div className={styles.imageWrap}>
        {business.cover_image_url ? (
          <WmImage
            src={business.cover_image_url}
            alt={business.name}
            fill
            sizes={variant === 'hero'
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px'
              : '(max-width: 640px) 50vw, 200px'}
            className={styles.image}
            priority={priority}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden />
        )}
        <div className={styles.imageOverlay} aria-hidden />

        {variant === 'hero' && (
          <span className={styles.badge}>
            <StarIcon size={12} /> مميز
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{business.name}</h3>

        <div className={styles.meta}>
          <span className={styles.type}>{typeLabel}</span>
          {business.area && (
            <>
              <span className={styles.dot} aria-hidden>·</span>
              <span className={styles.area}>
                <MapPinIcon size={11} />
                {business.area}
              </span>
            </>
          )}
        </div>

        {variant === 'hero' && business.hook && (
          <p className={styles.hook}>{business.hook}</p>
        )}

        <div className={styles.bottom}>
          {rating && (
            <span className={styles.rating}>
              <StarIcon size={12} /> {rating}
            </span>
          )}
          {variant === 'hero' && (
            <span className={styles.cta}>
              شوف النشاط <ArrowLeftIcon size={14} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
