'use client'
import Link from 'next/link'
import Image from 'next/image'
import './explore-card.css'
import FavoriteButton from './favorite-button'
import OpenNowBadge from './open-now-badge'
import './favorite-button.css'
import './open-now-badge.css'
import { IcDelivery, IcMarket, IcPharmacy, IcRestaurant, IcStar } from '@/components/eah-icons'
import { getCategoryLabel } from '@/lib/food/categories'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

type Business = {
  businessId?: string
  id?: string
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  is_premium?: boolean
  vibe: string[]
  reason: string
  open: boolean
  score?: number
  avg_rating?: number
  rating?: number
  review_count?: number
  reviewCount?: number
  recentViews?: number
  activeOffers?: number
  hook?: string
  workingHours?: unknown
  cover_image_url?: string
  coverImageUrl?: string
  food_categories?: string[]
}

const TYPE_ICON: Record<BusinessType, () => React.ReactElement> = {
  restaurant: IcRestaurant,
  pharmacy: IcPharmacy,
  supermarket: IcMarket,
  delivery_office: IcDelivery,
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
}

const TYPE_HUE: Record<BusinessType, string> = {
  restaurant: '#FF7A3D',
  pharmacy: '#C084FC',
  supermarket: '#00D9B8',
  delivery_office: '#E8C79A',
}

export default function ExploreCard({ business, index }: { business: Business; size?: string; index?: number }) {
  const hook = business.hook?.trim() || business.reason || ''
  const coverImage = business.cover_image_url || business.coverImageUrl
  const businessId = business.businessId || business.id
  const TypeIcon = TYPE_ICON[business.type] ?? IcRestaurant
  const rating = business.avg_rating ?? business.rating ?? 0
  const reviewCount = business.review_count ?? business.reviewCount ?? 0

  return (
    <article
      className="ecard"
      style={{
        '--hue': TYPE_HUE[business.type] ?? TYPE_HUE.restaurant,
        '--d': `${Math.min(index ?? 0, 8) * 45}ms`,
      } as React.CSSProperties}
    >
      <Link href={`/businesses/${business.slug}`} className="ecard__link" aria-label={`افتح صفحة ${business.name}`}>
        <div className="ecard__cover">
          {coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="ecard__img"
            />
          ) : (
            <div className="ecard__cover-fallback">
              <span className="ecard__cover-icon"><TypeIcon /></span>
            </div>
          )}
          <div className="ecard__cover-overlay" />

          {(business.recentViews ?? 0) > 0 && (
            <span className="ecard__views e-badge e-badge--muted" aria-label={`${business.recentViews} مشاهدة آخر 7 أيام`}>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {business.recentViews}
            </span>
          )}

          {rating > 0 && (
            <span className="ecard__rating-overlay" aria-label={`التقييم ${rating.toFixed(1)} من 5`}>
              <IcStar /> {rating.toFixed(1)}
              {reviewCount > 0 && <small>({reviewCount})</small>}
            </span>
          )}

          {(business.badge || business.is_premium) && (
            <span className={`ecard__badge ${business.is_premium || business.badge === 'مميز' ? 'ecard__badge--gold' : ''}`}>
              {(business.is_premium || business.badge === 'مميز') && <IcStar />}
              {business.is_premium ? 'مميز' : business.badge}
            </span>
          )}

          <div className="ecard__opennow e-badge e-badge--success">
            <OpenNowBadge workingHours={business.workingHours} />
          </div>
        </div>

        <div className="ecard__body">
          <div className="ecard__type-row">
            <span className="ecard__type e-badge e-badge--accent">
              <TypeIcon /> {TYPE_LABEL[business.type] ?? ''}
            </span>
            {rating > 0 && <span className="ecard__score e-badge e-badge--gold"><IcStar /> {rating.toFixed(1)}</span>}
          </div>

          <h3 className="ecard__name e-section__title">{business.name}</h3>
          <span className="ecard__area">{business.area}</span>
          {hook && <p className="ecard__hook">{hook}</p>}

          {(business.food_categories?.length ?? 0) > 0 && (
            <div className="ecard__tags" aria-label="تصنيفات الأكل">
              {business.food_categories!.slice(0, 3).map((key) => (
                <span key={key} className="ecard__tag">{getCategoryLabel(key)}</span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {businessId && (
        <div className="ecard__heart">
          <FavoriteButton businessId={businessId} size="sm" />
        </div>
      )}
    </article>
  )
}
