'use client'
import { useState } from 'react'
import './explore-card.css'
import FavoriteButton from './favorite-button'
import OpenNowBadge from './open-now-badge'
import './favorite-button.css'
import './open-now-badge.css'
import Image from 'next/image'
import { IcRestaurant, IcPharmacy, IcMarket, IcDelivery } from './eah-icons'
import { IcStar } from '@/components/eah-icons'

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
  recentViews?: number
  activeOffers?: number
  hook?: string
  workingHours?: any
  cover_image_url?: string
  coverImageUrl?: string
}

const TYPE_ICON: Partial<Record<BusinessType, () => React.ReactElement>> = {
  restaurant: IcRestaurant,
  pharmacy: IcPharmacy,
  delivery_office: IcDelivery,
}

const TYPE_LABEL: Partial<Record<BusinessType, string>> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
}

const TYPE_HUE: Partial<Record<BusinessType, string>> = {
  restaurant: '#FF7A3D',
  pharmacy: '#C084FC',
  delivery_office: '#E8C79A',
}

export default function ExploreCard({ business, index }: { business: Business; size?: string; index?: number }) {
  const [hovered, setHovered] = useState(false)
  const hook = business.hook?.trim() || business.reason || ''
  const coverImage = business.cover_image_url || business.coverImageUrl
  const bizId = business.businessId || business.id

  return (
    <a
      href={`/businesses/${business.slug}`}
      className={`ecard ${hovered ? 'is-hovered' : ''}`}
      aria-label={business.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        '--hue': TYPE_HUE[business.type],
        '--d': `${(index ?? 0) * 45}ms`,
      } as React.CSSProperties}
    >
      {/* صورة الغلاف أو تدرج */}
      <div className="ecard__cover">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={business.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="ecard__img"
          />
        ) : (
          <div className="ecard__cover-fallback">
            <span className="ecard__cover-icon">{(() => { const I = TYPE_ICON[business.type] ?? TYPE_ICON.restaurant!; return <I /> })()}</span>
          </div>
        )}
        <div className="ecard__cover-overlay" />

        {/* Views badge — 2026 style */}
        {typeof (business as any).recentViews === 'number' && (business as any).recentViews > 0 && (
          <span className="ecard__views e-badge e-badge--muted" aria-label="مشاهدات آخر 7 أيام">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {(business as any).recentViews}
          </span>
        )}

        {/* Rating overlay — 2026 */}
        {typeof business.rating === 'number' && business.rating > 0 && (
          <span className="ecard__rating-overlay" aria-label="متوسط التقييم">
            ★ {business.rating.toFixed(1)}
            {typeof business.review_count === 'number' && business.review_count > 0 && (
              <small>({business.review_count})</small>
            )}
          </span>
        )}

        {/* Badge */}
        {(business.badge || business.is_premium) && (
          <span className={`ecard__badge ${business.is_premium || business.badge === 'مميز' ? 'ecard__badge--gold' : ''}`}>
            {(business.is_premium || business.badge === 'مميز') && (
              <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden>
                <path d="M12 2l2.39 7.36H22l-6.2 4.5 2.39 7.36L12 16.72 5.81 21.22 8.2 13.86 2 9.36h7.61L12 2z" />
              </svg>
            )}
            {business.is_premium ? 'مميز' : business.badge}
          </span>
        )}

        {/* Heart */}
        {bizId && (
          <div className="ecard__heart">
            <FavoriteButton businessId={bizId} size="sm" />
          </div>
        )}

        {/* Open now */}
        <div className="ecard__opennow e-badge e-badge--success">
          <OpenNowBadge workingHours={business.workingHours} />
        </div>
      </div>

      {/* Body */}
      <div className="ecard__body">
        <div className="ecard__type-row">
          <span className="ecard__type e-badge e-badge--accent">
            {(() => { const I = TYPE_ICON[business.type] ?? TYPE_ICON.restaurant!; return <I /> })()} {TYPE_LABEL[business.type] ?? ''}
          </span>
          {(business.avg_rating ?? business.rating ?? 0) > 0 && (
            <span className="ecard__score e-badge e-badge--gold"><IcStar /> {(business.avg_rating ?? business.rating ?? 0).toFixed(1)}</span>
          )}
        </div>

        <h3 className="ecard__name e-section__title">{business.name}</h3>
        <span className="ecard__area">{business.area}</span>

        {hook && <p className="ecard__hook">{hook}</p>}
        {(business as any).food_categories && (business as any).food_categories.length > 0 && (
          <div className="ecard__tags">
            {((business as any).food_categories as string[]).slice(0, 3).map((k: string) => (
              <span key={k} className="ecard__tag">{k}</span>
            ))}
          </div>
        )}
      </div>
    </a>
  )
}
