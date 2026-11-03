import Link from 'next/link'
import CardImage from './card-image'
import DistanceBadge from './distance-badge'
import type { Business } from '@/lib/data/businesses'
import type { LatLng } from '@/lib/utils/distance'
import { isBusinessOpen } from '@/lib/utils/working-hours'
import { getBusinessTypeLabel } from '@/lib/business-type-label'
import {
  StarIcon,
  CrownGoldIcon,
  BadgeCheckIcon,
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
} from './icons'
import styles from './business-card.module.css'

export type CardTone = 'gold' | 'orange' | 'purple' | 'teal' | 'pink' | 'blue'
export type CardContext = 'default' | 'featured' | 'trending' | 'new' | 'nearby'

type Props = {
  business: Business
  tone?: CardTone
  variant?: 'default' | 'featured'
  context?: CardContext
  rank?: number
  isFavorite?: boolean
  viewerLocation?: LatLng | null
  showDistance?: boolean
}

type TypeMeta = { label: string; Icon: typeof UtensilsIcon }

const TYPE_META: Record<string, TypeMeta> = {
  restaurant: { label: 'مطعم', Icon: UtensilsIcon },
  pharmacy: { label: 'صيدلية', Icon: PillIcon },
  supermarket: { label: 'ماركت', Icon: StoreIcon },
  delivery_office: { label: 'توصيل', Icon: BikeIcon },
  misc: { label: 'أخرى', Icon: SparklesIcon },
}


function plural(n: number, forms: [string, string, string]): string {
  if (n <= 0) return ''
  if (n === 1) return forms[0]
  if (n === 2) return forms[1]
  return n + ' ' + forms[2]
}

export default function BusinessCard({
  business,
  tone = 'purple',
  variant = 'default',
  context,
  rank,
  isFavorite = false,
  viewerLocation,
  showDistance = true,
}: Props) {
  const typeMeta = TYPE_META[business.business_type] ?? TYPE_META.misc!
  const TypeIcon = typeMeta.Icon
  const typeLabel = getBusinessTypeLabel(business)
  const ctx: CardContext = context ?? (variant === 'featured' ? 'featured' : 'default')
  const isOpen = isBusinessOpen(business)
  const hasRating = business.rating_count > 0
  const locationLabel =
    business.area && business.city && business.area !== business.city
      ? business.area + '، ' + business.city
      : business.area || business.city
  const summary = business.hook?.trim() || business.description?.trim() || ''
  const showFeatured = ctx === 'featured' || business.is_featured
  const showNew = ctx === 'new' || business.is_new_project
  const rankClass =
    rank === 1
      ? styles.rankGold
      : rank === 2
        ? styles.rankSilver
        : rank === 3
          ? styles.rankBronze
          : ''

  return (
    <Link
      href={'/businesses/' + business.slug}
      className={[styles.card, styles[tone], variant === 'featured' && styles.featured]
        .filter(Boolean)
        .join(' ')}
      aria-label={'عرض تفاصيل نشاط ' + business.name}
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
          <div className={styles.badgeGroup}>
            {showFeatured && (
              <span className={styles.featuredBadge}>
                <CrownGoldIcon size={12} />
                مميز
              </span>
            )}
            {showNew && (
              <span className={styles.newBadge}>
                <SunriseIcon size={12} />
                جديد
              </span>
            )}
            {ctx === 'trending' && typeof rank === 'number' && (
              <span className={[styles.rankBadge, rankClass].filter(Boolean).join(' ')}>
                #{rank}
              </span>
            )}
            {business.is_verified && (
              <span className={styles.verifiedBadge}>
                <BadgeCheckIcon size={12} />
                موثّق
              </span>
            )}
            {isFavorite && (
              <span className={styles.favoriteBadge} aria-label="في المفضلة">
                <HeartIcon size={12} />
              </span>
            )}
          </div>

          {hasRating ? (
            <span
              className={styles.ratingBadge}
              aria-label={'التقييم ' + business.rating_avg.toFixed(1) + ' من 5'}
            >
              <StarIcon size={12} />
              <strong>{business.rating_avg.toFixed(1)}</strong>
              <span className={styles.ratingCount}>({business.rating_count})</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{business.name}</h3>
        </div>

        <div className={styles.imageMeta}>
          <span className={styles.typeLabel}>
            <TypeIcon size={13} />
            {typeLabel || typeMeta.label}
          </span>
          {locationLabel && (
            <span className={styles.location}>
              <MapPinIcon size={13} />
              <span>{locationLabel}</span>
            </span>
          )}
          <DistanceBadge
            lat={business.location?.lat ?? null}
            lng={business.location?.lng ?? null}
            userLocation={viewerLocation}
            enabled={showDistance}
          />
        </div>

        <p className={summary ? styles.hook : styles.hookMuted}>
          {summary || 'افتح صفحة النشاط لمعرفة التفاصيل المتاحة.'}
        </p>

        <div className={styles.infoRow}>
          <span className={[styles.status, isOpen ? styles.open : styles.closed].join(' ')}>
            {isOpen ? <CheckCircleIcon size={13} /> : <AlertIcon size={13} />}
            {isOpen ? 'مفتوح الآن' : 'مغلق الآن'}
          </span>
          {!hasRating && (
            <span className={styles.noRating}>
              <StarIcon size={13} />
              لسه مفيش تقييمات
            </span>
          )}
          <span
            className={[
              styles.channelBadge,
              business.accepts_orders ? styles.channelOrder : styles.channelUnavailable,
            ].join(' ')}
            aria-label={
              business.accepts_orders
                ? 'يستقبل طلبات أونلاين'
                : 'لا يستقبل طلبات أونلاين'
            }
          >
            {business.accepts_orders ? <StoreIcon size={13} /> : <AlertIcon size={13} />}
            {business.accepts_orders ? 'يستقبل طلبات أونلاين' : 'لا يستقبل طلبات أونلاين'}
          </span>

        </div>

        <div className={styles.footer}>
          <div className={styles.metrics} aria-label="معلومات النشاط">
            {business.branches_count > 0 && (
              <span className={styles.metric}>
                <StoreIcon size={13} />
                {plural(business.branches_count, ['فرع', 'فرعين', 'فروع'])}
              </span>
            )}
            {business.offers_count > 0 && (
              <span className={styles.metric}>
                <GiftIcon size={13} />
                {plural(business.offers_count, ['عرض', 'عرضين', 'عروض'])}
              </span>
            )}
            {business.successful_orders > 0 && (
              <span className={styles.metric}>
                <CheckCircleIcon size={13} />
                {plural(business.successful_orders, ['طلب مكتمل', 'طلبين مكتملين', 'طلبات مكتملة'])}
              </span>
            )}
          </div>
          <span className={styles.cta}>
            <span>تفاصيل النشاط</span>
            <ArrowLeftIcon size={14} />
          </span>
        </div>
      </div>
    </Link>
  )
}
