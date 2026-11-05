import DetailLogo from './detail-logo'
import DetailCover from './detail-cover'
import {
  StarIcon,
  BadgeCheckIcon,
  MapPinIcon,
  CheckCircleIcon,
  AlertIcon,
  CrownGoldIcon,
  SunriseIcon,
  StoreIcon,
  WhatsAppIcon,
} from './icons'
import DistanceBadge from './distance-badge'
import type { BusinessDetail } from '@/lib/data/business-detail'
import { getBusinessTypeLabel } from '@/lib/business-type-label'
import styles from './business-hero.module.css'

type Props = {
  detail: BusinessDetail
  isOpen: boolean
}

export default function BusinessHero({ detail, isOpen }: Props) {
  const { business, cover, logo } = detail
  const typeLabel = getBusinessTypeLabel(business)

  const hasRating = business.rating_count > 0
  const ratingValue = hasRating ? business.rating_avg.toFixed(1) : null
  const summary = business.hook?.trim() || business.description?.trim() || ''
  const locationLabel =
    business.area && business.city && business.area !== business.city
      ? business.area + '، ' + business.city
      : business.area || business.city
  const addressText = business.address_text?.trim() ?? ''

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
          <DetailLogo
            src={logo?.storage_path ?? null}
            alt={`شعار ${business.name}`}
            initial={business.name.charAt(0)}
          />
        </div>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            <h1 className={styles.name}>{business.name}</h1>
            {business.is_verified && (
              <span className={styles.verified} title="تحققت إدارة EAH من بيانات النشاط">
                <BadgeCheckIcon size={15} />
                موثّق من الإدارة
              </span>
            )}
          </div>

          <div className={styles.metaRow}>
            <span className={styles.type}>{typeLabel}</span>
            {locationLabel && (
              <>
                <span className={styles.dot}>·</span>
                <span className={styles.area}>
                  <MapPinIcon size={12} />
                  {locationLabel}
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

          {(business.is_featured ||
            business.is_new_project ||
            business.accepts_orders ||
            business.accepts_whatsapp_orders) && (
            <div className={styles.badges} aria-label="مميزات النشاط وطرق الطلب">
              {business.is_featured && (
                <span className={[styles.tier, styles.tier_gold].join(' ')}>
                  <CrownGoldIcon size={13} />
                  نشاط مميز
                </span>
              )}
              {business.is_new_project && (
                <span className={[styles.tier, styles.tier_teal].join(' ')}>
                  <SunriseIcon size={13} />
                  مشروع جديد
                </span>
              )}
              {business.accepts_orders && (
                <span className={[styles.tier, styles.tier_purple].join(' ')}>
                  <StoreIcon size={13} />
                  طلبات داخل المنصة
                </span>
              )}
              {business.accepts_whatsapp_orders && (
                <span className={styles.trust}>
                  <WhatsAppIcon size={13} />
                  يستقبل طلبات واتساب
                </span>
              )}
            </div>
          )}

          {addressText && addressText !== locationLabel && (
            <p className={styles.hook}>
              <MapPinIcon size={14} /> {addressText}
            </p>
          )}

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

          {summary && <p className={styles.hook}>{summary}</p>}
        </div>
      </div>
    </section>
  )
}
