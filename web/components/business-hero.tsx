import Image from 'next/image'
import DetailCover from './detail-cover'
import { StarIcon, BadgeCheckIcon, MapPinIcon, CheckCircleIcon, AlertIcon } from './icons'
import DistanceBadge from './distance-badge'
import type { BusinessDetail } from '@/lib/data/business-detail'
import { TYPE_LABEL, TIER_LABEL, TIER_EMOJI } from '@/lib/data/business-detail'
import styles from './business-hero.module.css'

type Props = {
  detail: BusinessDetail
  isOpen: boolean
}

const TIER_TONE: Record<string, 'teal' | 'gold' | 'purple'> = {
  baraka: 'purple',
  active: 'teal',
  mo3tabar: 'teal',
  kebeer: 'gold',
  legend: 'gold',
}

export default function BusinessHero({ detail, isOpen }: Props) {
  const { business, cover, logo } = detail
  const typeLabel = TYPE_LABEL[business.business_type] ?? 'نشاط'
  const tierLabel = TIER_LABEL[business.trust_tier] ?? null
  const tierEmoji = TIER_EMOJI[business.trust_tier] ?? ''
  const tierTone = TIER_TONE[business.trust_tier] ?? 'purple'

  const hasRating = business.rating_count > 0
  const ratingValue = hasRating ? business.rating_avg.toFixed(1) : null

  return (
    <section className={`${styles.hero} ${business.is_featured ? styles.featured : ''}`}>
      {/* ─── Cover ─── */}
      <div className={styles.cover}>
        <DetailCover
          src={cover?.storage_path ?? business.cover_image_url ?? null}
          alt={business.name}
        />
        <div className={styles.coverOverlay} aria-hidden />
      </div>

      {/* ─── Content ─── */}
      <div className={styles.body}>
        <div className={styles.logoWrap}>
          {logo ? (
            <Image
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
            {business.is_verified && (
              <span className={styles.verified} title="نشاط موثّق">
                <BadgeCheckIcon size={15} />
                موثّق
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
            {tierLabel && (
              <span className={`${styles.tier} ${styles['tier_' + tierTone]}`}>
                {tierEmoji ? tierEmoji + ' ' : ''}{tierLabel}
              </span>
            )}
            {business.trust_score > 0 && (
              <span className={styles.trust}>مصداقية {business.trust_score}</span>
            )}
          </div>

          {/* Rating + Stats */}
          <div className={styles.stats}>
            {hasRating ? (
              <div className={styles.ratingBig}>
                <span className={styles.ratingValue}>{ratingValue}</span>
                <span className={styles.ratingStars}>
                  <StarIcon size={16} />
                </span>
                <span className={styles.ratingCount}>({business.rating_count})</span>
              </div>
            ) : (
              <div className={styles.ratingEmpty}>لسه مفيش تقييمات</div>
            )}
            {business.successful_orders > 0 && (
              <div className={styles.statSmall}>
                <span className={styles.statValue}>{business.successful_orders}+</span>
                <span className={styles.statLabel}>طلب ناجح</span>
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

          {(business.hook || business.description) && (
            <p className={styles.hook}>{business.hook || business.description}</p>
          )}
        </div>
      </div>
    </section>
  )
}
