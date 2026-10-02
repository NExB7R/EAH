import WmImage from './wm-image'
import { StarIcon, BadgeCheckIcon, MapPinIcon, CheckCircleIcon, AlertIcon } from './icons'
import DistanceBadge from './distance-badge'
import type { BusinessDetail } from '@/lib/data/business-detail'
import { TYPE_LABEL, TIER_LABEL } from '@/lib/data/business-detail'
import styles from './business-hero.module.css'

type Props = {
  detail: BusinessDetail
  isOpen: boolean
}

const TIER_TONE: Record<string, 'teal' | 'gold' | 'purple'> = {
  trusted: 'teal',
  verified: 'gold',
  new: 'purple',
}

export default function BusinessHero({ detail, isOpen }: Props) {
  const { business, cover, logo } = detail
  const typeLabel = TYPE_LABEL[business.business_type] ?? 'نشاط'
  const tierLabel = TIER_LABEL[business.trust_tier] ?? business.trust_tier
  const tierTone = TIER_TONE[business.trust_tier] ?? 'purple'

  const hasRating = business.rating_count > 0
  const ratingValue = hasRating ? business.rating_avg.toFixed(1) : null

  return (
    <section className={`${styles.hero} ${business.is_featured ? styles.featured : ''}`}>
      {/* ─── Cover ─── */}
      <div className={styles.cover}>
        {cover ? (
          <WmImage
            src={cover.storage_path}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className={styles.coverImg}
            priority
          />
        ) : business.cover_image_url ? (
          <WmImage
            src={business.cover_image_url}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className={styles.coverImg}
            priority
          />
        ) : (
          <div className={styles.coverFallback} aria-hidden />
        )}
        <div className={styles.coverOverlay} aria-hidden />
      </div>

      {/* ─── Content ─── */}
      <div className={styles.body}>
        <div className={styles.logoWrap}>
          {logo ? (
            <WmImage
              src={logo.storage_path}
              alt={business.name}
              fill
              sizes="120px"
              className={styles.logoImg}
            />
          ) : (
            <div className={styles.logoFallback} aria-hidden>
              {business.name.charAt(0)}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1 className={styles.name}>{business.name}</h1>
            {business.trust_tier === 'trusted' && (
              <span className={styles.verified} title="موثّق">
                <BadgeCheckIcon size={18} />
              </span>
            )}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.type}>{typeLabel}</span>
            {business.area && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.area}>
                  <MapPinIcon size={12} />
                  {business.area}
                </span>
              </>
            )}
            <span className={styles.dot}>·</span>
            <span className={`${styles.status} ${isOpen ? styles.open : styles.closed}`}>
              {isOpen ? <CheckCircleIcon size={11} /> : <AlertIcon size={11} />}
              {isOpen ? 'مفتوح' : 'مغلق'}
            </span>
            {business.location && (
              <DistanceBadge
                lat={business.location.lat}
                lng={business.location.lng}
                className={styles.distanceHero}
              />
            )}
          </div>

          <div className={styles.badges}>
            <span className={`${styles.tier} ${styles['tier_' + tierTone]}`}>{tierLabel}</span>
            {business.trust_score > 0 && (
              <span className={styles.trust}>مصداقية {business.trust_score}</span>
            )}
          </div>

          {/* Rating + Stats */}
          <div className={styles.stats}>
            {hasRating && (
              <div className={styles.ratingBig}>
                <span className={styles.ratingValue}>{ratingValue}</span>
                <span className={styles.ratingStars}>
                  <StarIcon size={16} />
                </span>
                <span className={styles.ratingCount}>({business.rating_count})</span>
              </div>
            )}
            {business.successful_orders > 0 && (
              <div className={styles.statSmall}>
                <span className={styles.statValue}>{business.successful_orders}+</span>
                <span className={styles.statLabel}>طلب</span>
              </div>
            )}
            {business.branches_count > 0 && (
              <div className={styles.statSmall}>
                <span className={styles.statValue}>{business.branches_count}</span>
                <span className={styles.statLabel}>
                  {business.branches_count === 1 ? 'فرع' : 'فروع'}
                </span>
              </div>
            )}
          </div>

          {business.hook && <p className={styles.hook}>{business.hook}</p>}
        </div>
      </div>
    </section>
  )
}
