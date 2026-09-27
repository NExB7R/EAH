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
  StoreIcon,
  GiftIcon,
} from './icons'
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

// ═══════════════════════════════════════════════════════════
// Helper: نص مختصر للعروض (1 / 2 / 3+)
// ═══════════════════════════════════════════════════════════
function offersText(count: number): string {
  if (count === 0) return ''
  if (count === 1) return 'عرض'
  if (count === 2) return 'عرضين'
  return `${count} عروض`
}

function branchesText(count: number): string {
  if (count === 0) return ''
  if (count === 1) return 'فرع'
  if (count === 2) return 'فرعين'
  return `${count} فروع`
}

export default function FeaturedCard({ business, variant, priority }: Props) {
  const typeMeta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = typeMeta.Icon
  const typeLabel = typeMeta.label
  const tierLabel = TIER_LABEL[business.trust_tier] ?? business.trust_tier

  // rating: لو فيه تقييمات حقيقية → rating_avg، وإلا trust_score/20
  const hasRealRating = business.rating_count > 0
  const ratingValue = hasRealRating
    ? business.rating_avg.toFixed(1)
    : business.trust_score
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

          {ratingValue && (
            <span className={`${styles.chip} ${styles.chipGold}`}>
              <StarIcon size={12} />
              {ratingValue}
              {hasRealRating && (
                <span className={styles.chipCount}>({business.rating_count})</span>
              )}
            </span>
          )}

          {tierLabel && (
            <span className={`${styles.chip} ${styles.chipTrust}`}>
              <ShieldCheckIcon size={12} />
              {tierLabel}
            </span>
          )}

          {business.branches_count > 0 && (
            <span className={styles.chip}>
              <StoreIcon size={12} />
              {branchesText(business.branches_count)}
            </span>
          )}

          {business.offers_count > 0 && (
            <span className={`${styles.chip} ${styles.chipOffers}`}>
              <GiftIcon size={12} />
              {offersText(business.offers_count)}
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
