import Link from 'next/link'
import WmImage from './wm-image'
import type { Business } from '@/lib/data/businesses'
import { BadgeCheckIcon, StarIcon, CrownGoldIcon } from './icons'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Card
// ═══════════════════════════════════════════════════════════

type Props = {
  business: Business
  variant?: 'default' | 'featured' | 'compact'
}

const TYPE_LABELS: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'نشاط',
}

export default function BusinessCard({ business, variant = 'default' }: Props) {
  const label = TYPE_LABELS[business.business_type] ?? 'نشاط'
  const cls = [styles.card, styles[variant]].filter(Boolean).join(' ')
  const hasImage = !!business.cover_image_url

  return (
    <Link href={`/businesses/${business.slug}`} className={cls}>
      <div className={styles.imageWrap}>
        {hasImage ? (
          <WmImage
            src={business.cover_image_url!}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder} aria-hidden>
            <span className={styles.placeholderLetter}>
              {business.name.charAt(0)}
            </span>
          </div>
        )}

        {variant === 'featured' && (
          <span className={styles.featuredBadge}>
            <CrownGoldIcon size={14} />
            <span>مميز</span>
          </span>
        )}

        {business.is_open ? (
          <span className={`${styles.status} ${styles.open}`}>مفتوح</span>
        ) : (
          <span className={`${styles.status} ${styles.closed}`}>مغلق</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.head}>
          <h3 className={styles.name}>{business.name}</h3>
          {business.trust_tier === 'trusted' && (
            <span className={styles.verified} title="موثوق">
              <BadgeCheckIcon size={14} />
            </span>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.type}>{label}</span>
          {business.area && (
            <>
              <span className={styles.dot} aria-hidden>·</span>
              <span className={styles.area}>{business.area}</span>
            </>
          )}
        </div>

        {variant !== 'compact' && business.hook && (
          <p className={styles.hook}>{business.hook}</p>
        )}

        <div className={styles.footer}>
          <span className={styles.rating}>
            <StarIcon size={14} />
            <span>{business.trust_score}</span>
          </span>
          {business.successful_orders > 0 && (
            <span className={styles.orders}>
              {business.successful_orders}+ طلب
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
