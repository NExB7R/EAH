'use client'

import Link from 'next/link'
import WmImage from './wm-image'
import {
  StarIcon,
  MapPinIcon,
  UtensilsIcon,
  PillIcon,
  CartIcon,
  BikeIcon,
  SparklesIcon,
  ShieldCheckIcon,
  WhatsAppIcon,
  StoreIcon,
  GiftIcon,
  CheckCircleIcon,
  AlertIcon,
} from './icons'
import type { Business } from '@/lib/data'
import styles from './featured-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Featured Card (تصميم موحّد 2026)
// ═══════════════════════════════════════════════════════════

type Props = {
  business: Business
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

function offersText(n: number): string {
  if (n === 0) return ''
  if (n === 1) return 'عرض'
  if (n === 2) return 'عرضين'
  return `${n} عروض`
}

function branchesText(n: number): string {
  if (n === 0) return ''
  if (n === 1) return 'فرع'
  if (n === 2) return 'فرعين'
  return `${n} فروع`
}

export default function FeaturedCard({ business, priority }: Props) {
  const meta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = meta.Icon
  const tierLabel = TIER_LABEL[business.trust_tier] ?? business.trust_tier

  const hasRealRating = business.rating_count > 0
  const ratingValue = hasRealRating
    ? business.rating_avg.toFixed(1)
    : business.trust_score
    ? (business.trust_score / 20).toFixed(1)
    : null

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={styles.card}
      aria-label={business.name}
    >
      <div className={styles.imageWrap}>
        {business.cover_image_url ? (
          <WmImage
            src={business.cover_image_url}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
            className={styles.image}
            priority={priority}
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden>
            <div className={styles.fallbackGlow} />
            <div className={styles.fallbackIcon}>
              <TypeIcon size={44} />
            </div>
          </div>
        )}
        <div className={styles.imageOverlay} aria-hidden />

        <span
          className={`${styles.statusDot} ${business.is_open ? styles.dotOpen : styles.dotClosed}`}
          aria-label={business.is_open ? 'مفتوح' : 'مقفل'}
        >
          {business.is_open ? <CheckCircleIcon size={11} /> : <AlertIcon size={11} />}
        </span>

        {ratingValue && (
          <span className={styles.ratingBadge}>
            <StarIcon size={11} />
            {ratingValue}
            {hasRealRating && (
              <span className={styles.ratingCount}>({business.rating_count})</span>
            )}
          </span>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{business.name}</h3>

        <p className={styles.meta}>
          <TypeIcon size={12} />
          <span>{meta.label}</span>
          {business.area && (
            <>
              <span className={styles.metaDot}>·</span>
              <MapPinIcon size={11} />
              <span>{business.area}</span>
            </>
          )}
        </p>

        <div className={styles.chips}>
          {tierLabel && (
            <span className={`${styles.chip} ${styles.chipTrust}`}>
              <ShieldCheckIcon size={11} />
              {tierLabel}
            </span>
          )}
          {business.branches_count > 0 && (
            <span className={styles.chip}>
              <StoreIcon size={11} />
              {branchesText(business.branches_count)}
            </span>
          )}
          {business.offers_count > 0 && (
            <span className={`${styles.chip} ${styles.chipGold}`}>
              <GiftIcon size={11} />
              {offersText(business.offers_count)}
            </span>
          )}
          {business.accepts_whatsapp_orders && (
            <span className={`${styles.chip} ${styles.chipWhats}`}>
              <WhatsAppIcon size={11} />
              واتساب
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
