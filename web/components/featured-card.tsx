'use client'

import Link from 'next/link'
import WmImage from './wm-image'
import {
  StarIcon,
  MapPinIcon,
  ArrowLeftIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertIcon,
  WhatsAppIcon,
} from './icons'
import type { Business } from '@/lib/data'
import styles from './featured-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Card (Hero + Small)
// كل حاجة badges صغيرة — خفيف وسريع
// ═══════════════════════════════════════════════════════════

type Props = {
  business: Business
  variant: 'hero' | 'small'
  priority?: boolean
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }

const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  supermarket: { label: 'ماركت', Icon: CartIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  misc: { label: 'أنشطة', Icon: SparklesIcon },
}

const TIER_LABEL: Record<string, string> = {
  trusted: 'موثوق',
  verified: 'مُوثَّق',
  new: 'جديد',
}

export default function FeaturedCard({ business, variant, priority }: Props) {
  const typeMeta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = typeMeta.Icon
  const typeLabel = typeMeta.label
  const tierLabel = TIER_LABEL[business.trust_tier] ?? business.trust_tier

  const rating = business.trust_score
    ? (business.trust_score / 20).toFixed(1)
    : null

  const isHero = variant === 'hero'

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
            sizes={isHero
              ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px'
              : '(max-width: 640px) 50vw, 200px'}
            className={styles.image}
            priority={priority}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden />
        )}
        <div className={styles.imageOverlay} aria-hidden />

        <div className={styles.topBadges}>
          {isHero && (
            <span className={styles.badgePremium}>
              <StarIcon size={11} /> مميز
            </span>
          )}
          <span
            className={`${styles.badgeStatus} ${business.is_open ? styles.badgeOpen : styles.badgeClosed}`}
          >
            {business.is_open ? <CheckCircleIcon size={11} /> : <AlertIcon size={11} />}
            {business.is_open ? 'مفتوح' : 'مقفل'}
          </span>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{business.name}</h3>

        {isHero && business.hook && (
          <p className={styles.hook}>{business.hook}</p>
        )}

        <div className={styles.badges}>
          <span className={styles.chip}>
            <TypeIcon size={12} />
            {typeLabel}
          </span>

          {business.area && (
            <span className={styles.chip}>
              <MapPinIcon size={12} />
              {business.area}
            </span>
          )}

          {rating && (
            <span className={`${styles.chip} ${styles.chipGold}`}>
              <StarIcon size={12} />
              {rating}
            </span>
          )}

          {tierLabel && (
            <span className={`${styles.chip} ${styles.chipTrust}`}>
              <ShieldCheckIcon size={12} />
              {tierLabel}
            </span>
          )}

          {business.accepts_whatsapp_orders && (
            <span className={`${styles.chip} ${styles.chipWhatsapp}`}>
              <WhatsAppIcon size={12} />
              واتساب
            </span>
          )}
        </div>

        {isHero && (
          <div className={styles.bottom}>
            <span className={styles.cta}>
              شوف النشاط <ArrowLeftIcon size={14} />
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
