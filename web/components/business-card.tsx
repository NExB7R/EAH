import Link from 'next/link'
import WmImage from './wm-image'
import DistanceBadge from './distance-badge'
import type { Business } from '@/lib/data/businesses'
import { getBusinessTypeLabel } from '@/lib/business-type-label'
import {
  StarIcon,
  CrownGoldIcon,
  ShieldCheckIcon,
  BadgeCheckIcon,
  SparkleStarIcon,
  CheckCircleIcon,
  AlertIcon,
  WhatsAppIcon,
  StoreIcon,
  GiftIcon,
  MapPinIcon,
  UtensilsIcon,
  PillIcon,
  BikeIcon,
  SparklesIcon,
} from './icons'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Card (Premium 2026)
//   • tone → لون القسم (ذهبي/برتقالي/بنفسجي...)
//   • تفاصيل غنية (type + area + rating + tier + offers + whatsapp)
// ═══════════════════════════════════════════════════════════

export type CardTone = 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'

type Props = {
  business: Business
  tone?: CardTone
  variant?: 'default' | 'featured'
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }

const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  misc: { label: 'أخرى', Icon: SparklesIcon },
}

type TierMeta = { label: string; cls: string; Icon: typeof ShieldCheckIcon }
const TIER_META: Record<string, TierMeta> = {
  bade2: { label: 'لسه بادئ', cls: 'bade2', Icon: SparkleStarIcon },
  mashey: { label: 'ماشي حاله', cls: 'mashey', Icon: ShieldCheckIcon },
  fel: { label: 'زي الفل', cls: 'fel', Icon: ShieldCheckIcon },
  harif: { label: 'حريف', cls: 'harif', Icon: BadgeCheckIcon },
  ostora: { label: 'الأسطورة', cls: 'ostora', Icon: BadgeCheckIcon },
}

function offersText(c: number): string {
  if (c === 0) return ''
  if (c === 1) return 'عرض'
  if (c === 2) return 'عرضين'
  return `${c} عروض`
}

function branchesText(c: number): string {
  if (c === 0) return ''
  if (c === 1) return 'فرع'
  if (c === 2) return 'فرعين'
  return `${c} فروع`
}

export default function BusinessCard({ business, tone = 'purple', variant = 'default' }: Props) {
  const meta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = meta.Icon
  const typeLabel = getBusinessTypeLabel(business)
  const tier = TIER_META[business.trust_tier] ?? null

  // Never display a trust score as a star rating. Only show a rating when
  // real approved review data exists for this business.
  const hasRealRating = business.rating_count > 0
  const ratingValue = hasRealRating ? business.rating_avg.toFixed(1) : null

  const hasImage = !!business.cover_image_url

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`${styles.card} ${styles[tone]} ${variant === 'featured' ? styles.featured : ''}`}
    >
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
            <TypeIcon size={40} />
          </div>
        )}
        <div className={styles.imageOverlay} aria-hidden />

        <div className={styles.topBadges}>
          {variant === 'featured' && (
            <span className={styles.featuredBadge}>
              <CrownGoldIcon size={11} />
              مميز
            </span>
          )}
          <span className={`${styles.status} ${business.is_open ? styles.open : styles.closed}`}>
            {business.is_open ? <CheckCircleIcon size={11} /> : <AlertIcon size={11} />}
            {business.is_open ? 'مفتوح' : 'مغلق'}
          </span>
        </div>

        {ratingValue && (
          <span className={styles.ratingOnImage}>
            <StarIcon size={11} />
            {ratingValue}
            {hasRealRating && <span className={styles.ratingCount}>({business.rating_count})</span>}
          </span>
        )}

        {business.location && (
          <div className={styles.distanceOnImage}>
            <DistanceBadge lat={business.location.lat} lng={business.location.lng} />
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{business.name}</h3>

        {business.hook && <p className={styles.hook}>{business.hook}</p>}

        <div className={styles.chips}>
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

          {tier && (
            <span className={`${styles.chip} ${styles.chipTrust} ${styles[`tier_${tier.cls}`]}`}>
              <tier.Icon size={12} />
              {tier.label}
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
      </div>
    </Link>
  )
}
