import Link from 'next/link'
import CardImage from './card-image'
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
  StoreIcon,
  GiftIcon,
  MapPinIcon,
  UtensilsIcon,
  PillIcon,
  BikeIcon,
  SparklesIcon,
  ArrowLeftIcon,
  SunriseIcon,
  TrendingUpIcon,
} from './icons'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Card (Premium 2026)
//   • tone → لون القسم (ذهبي/برتقالي/بنفسجي...)
//   • تفاصيل غنية (type + area + rating + tier + offers + whatsapp)
// ═══════════════════════════════════════════════════════════

export type CardTone = 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'
export type CardContext = 'default' | 'featured' | 'trending' | 'new' | 'nearby'

type Props = {
  business: Business
  tone?: CardTone
  variant?: 'default' | 'featured'
  context?: CardContext
  rank?: number
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

export default function BusinessCard({
  business,
  tone = 'purple',
  variant = 'default',
  context,
  rank,
}: Props) {
  const ctx: CardContext = context ?? (variant === 'featured' ? 'featured' : 'default')
  const meta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = meta.Icon
  const typeLabel = getBusinessTypeLabel(business)
  const tier = TIER_META[business.trust_tier] ?? null

  // Never display a trust score as a star rating. Only show a rating when
  // real approved review data exists for this business.
  const hasRealRating = business.rating_count > 0
  const ratingValue = hasRealRating ? business.rating_avg.toFixed(1) : null

  // ═══ Context-specific logic ═══
  // CTA text — يعكس الغرض من القسم
  const isOrderable =
    business.is_open &&
    (business.business_type === 'restaurant' ||
      business.business_type === 'pharmacy' ||
      business.business_type === 'delivery_office')

  const ctaText = (() => {
    if (isOrderable) return 'اطلب دلوقتي'
    switch (ctx) {
      case 'featured':
        return 'اكتشف المميز'
      case 'trending':
        return 'اكتشف ليه'
      case 'new':
        return 'ادعمهم'
      case 'nearby':
        return 'شوف التفاصيل'
      default:
        return 'شوف التفاصيل'
    }
  })()

  // Trending signal — دليل إن النشاط ترند
  const trendSignal =
    business.successful_orders > 0
      ? `${business.successful_orders} ${business.successful_orders === 1 ? 'طلب ناجح' : 'طلب ناجح'}`
      : null

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`${styles.card} ${styles[tone]} ${variant === 'featured' ? styles.featured : ''}`}
    >
      <div className={styles.imageWrap}>
        <CardImage
          src={business.cover_image_url}
          alt={business.name}
          initial={business.name.charAt(0)}
          typeLabel={typeLabel}
        />
        <div className={styles.imageOverlay} aria-hidden />

        <div className={styles.topBadges}>
          {ctx === 'featured' && (
            <span className={styles.featuredBadge}>
              <CrownGoldIcon size={11} />
              مميز
            </span>
          )}
          {ctx === 'new' && (
            <span className={styles.newBadge}>
              <SunriseIcon size={11} />
              جديد
            </span>
          )}
          {ctx === 'trending' && typeof rank === 'number' && (
            <span
              className={`${styles.rankBadge} ${
                rank === 1
                  ? styles.rankGold
                  : rank === 2
                    ? styles.rankSilver
                    : rank === 3
                      ? styles.rankBronze
                      : ''
              }`}
            >
              #{rank}
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

        {ctx === 'trending' && trendSignal && (
          <p className={`${styles.contextLine} ${styles.contextTrending}`}>
            <TrendingUpIcon size={11} />
            {trendSignal}
          </p>
        )}
        {ctx === 'nearby' && business.area && (
          <p className={`${styles.contextLine} ${styles.contextNearby}`}>
            <MapPinIcon size={11} />
            من {business.area}
          </p>
        )}
        {ctx === 'featured' && (
          <p className={`${styles.contextLine} ${styles.contextFeatured}`}>
            <CrownGoldIcon size={11} />
            اختيار فريق EAH
          </p>
        )}

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
        </div>

        <div className={styles.ctaWrap}>
          <span className={`${styles.cta} ${isOrderable ? styles.ctaOrder : ''}`}>
            <span>{ctaText}</span>
            <ArrowLeftIcon size={12} />
          </span>
        </div>
      </div>
    </Link>
  )
}
