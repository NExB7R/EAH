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
  HeartIcon,
  ArrowLeftIcon,
  SunriseIcon,
  TrendingUpIcon,
  CartIcon,
} from './icons'
import styles from './business-card.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Business Card (Premium 2026)
//   • Logo on gradient + overlay info
//   • Rating · verified · favorite · status on image
//   • Chips + hook + CTA below
// ═══════════════════════════════════════════════════════════

export type CardTone = 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'
export type CardContext = 'default' | 'featured' | 'trending' | 'new' | 'nearby'

type Props = {
  business: Business
  tone?: CardTone
  variant?: 'default' | 'featured'
  context?: CardContext
  rank?: number
  isFavorite?: boolean
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }
const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  supermarket: { label: 'ماركت', Icon: CartIcon },
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

function plural(n: number, forms: [string, string, string]): string {
  if (n === 0) return ''
  if (n === 1) return forms[0]
  if (n === 2) return forms[1]
  return `${n} ${forms[2]}`
}

export default function BusinessCard({
  business,
  tone = 'purple',
  variant = 'default',
  context,
  rank,
  isFavorite = false,
}: Props) {
  const meta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = meta.Icon
  const typeLabel = getBusinessTypeLabel(business)
  const tier = TIER_META[business.trust_tier] ?? null
  const ctx: CardContext = context ?? (variant === 'featured' ? 'featured' : 'default')

  const hasRating = business.rating_count > 0
  const rating = hasRating ? business.rating_avg.toFixed(1) : null
  const isOrderable = business.orders_enabled && business.is_open

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

  const branchesText = plural(business.branches_count, ['فرع', 'فرعين', 'فروع'])
  const offersText = plural(business.offers_count, ['عرض', 'عرضين', 'عروض'])

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`${styles.card} ${styles[tone]} ${variant === 'featured' ? styles.featured : ''}`}
    >
      <div className={styles.imageWrap}>
        <CardImage
          logoUrl={business.logo_url ?? null}
          coverUrl={business.cover_image_url}
          alt={business.name}
          initial={business.name.charAt(0)}
        />
        <div className={styles.imageOverlay} aria-hidden />

        <div className={styles.topBadges}>
          <div className={styles.badgesLeft}>
            {ctx === 'featured' && (
              <span className={styles.featuredBadge}>
                <CrownGoldIcon size={11} /> مميز
              </span>
            )}
            {ctx === 'new' && (
              <span className={styles.newBadge}>
                <SunriseIcon size={11} /> جديد
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
            {business.is_verified && (
              <span className={styles.verifiedBadge} aria-label="موثق">
                <BadgeCheckIcon size={11} /> موثق
              </span>
            )}
          </div>
          <div className={styles.badgesRight}>
            {isFavorite && (
              <span className={styles.favoriteBadge} aria-label="في مفضلاتك">
                <HeartIcon size={11} />
              </span>
            )}
            <span className={`${styles.status} ${business.is_open ? styles.open : styles.closed}`}>
              {business.is_open ? <CheckCircleIcon size={10} /> : <AlertIcon size={10} />}
              {business.is_open ? 'مفتوح' : 'مغلق'}
            </span>
          </div>
        </div>

        {rating && (
          <span className={styles.ratingOnImage}>
            <StarIcon size={11} />
            {rating}
            <span className={styles.ratingCount}>({business.rating_count})</span>
          </span>
        )}

        <div className={styles.imageInfo}>
          <h3 className={styles.name}>{business.name}</h3>
          <div className={styles.imageMeta}>
            {business.area && (
              <span>
                <MapPinIcon size={11} />
                {business.area}
              </span>
            )}
            <DistanceBadge
              lat={business.location?.lat ?? null}
              lng={business.location?.lng ?? null}
            />
          </div>
        </div>
      </div>

      <div className={styles.body}>
        {business.hook && <p className={styles.hook}>{business.hook}</p>}

        <div className={styles.chips}>
          <span className={styles.chip}>
            <TypeIcon size={11} />
            {typeLabel}
          </span>
          {tier && (
            <span className={`${styles.chip} ${styles[`tier_${tier.cls}`]}`}>
              <tier.Icon size={11} />
              {tier.label}
            </span>
          )}
          {business.branches_count > 0 && (
            <span className={styles.chip}>
              <StoreIcon size={11} />
              {branchesText}
            </span>
          )}
          {business.offers_count > 0 && (
            <span className={`${styles.chip} ${styles.chipOffers}`}>
              <GiftIcon size={11} />
              {offersText}
            </span>
          )}
          {business.accepts_whatsapp_orders && (
            <span className={`${styles.chip} ${styles.chipOrder}`}>
              <TrendingUpIcon size={11} />
              بيستقبل طلبات
            </span>
          )}
        </div>

        <span className={`${styles.cta} ${isOrderable ? styles.ctaOrder : ''}`}>
          <span>{ctaText}</span>
          <ArrowLeftIcon size={12} />
        </span>
      </div>
    </Link>
  )
}
