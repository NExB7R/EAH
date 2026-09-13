'use client'
import { useState } from 'react'
import './explore-card.css'
import FavoriteButton from './favorite-button'
import OpenNowBadge from './open-now-badge'
import './favorite-button.css'
import './open-now-badge.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'delivery_office'

type Business = {
  businessId?: string
  id?: string
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  score?: number
  activeOffers?: number
  hook?: string
  workingHours?: any
  cover_image_url?: string
  coverImageUrl?: string
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
}

const TYPE_HUE: Record<BusinessType, string> = {
  restaurant: '#FF7A3D',
  pharmacy: '#4ADE80',
  delivery_office: '#E8C79A',
}

export default function ExploreCard({ business }: { business: Business; size?: string }) {
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
      style={{ '--hue': TYPE_HUE[business.type] } as React.CSSProperties}
    >
      {/* صورة الغلاف أو تدرج */}
      <div className="ecard__cover">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverImage} alt={business.name} loading="lazy" />
        ) : (
          <div className="ecard__cover-fallback">
            <span className="ecard__cover-emoji">{TYPE_EMOJI[business.type]}</span>
          </div>
        )}
        <div className="ecard__cover-overlay" />

        {/* Badge */}
        {business.badge && (
          <span className={`ecard__badge ${business.badge === 'مميز' ? 'ecard__badge--gold' : ''}`}>
            {business.badge}
          </span>
        )}

        {/* Heart */}
        {bizId && (
          <div className="ecard__heart">
            <FavoriteButton businessId={bizId} size="sm" />
          </div>
        )}

        {/* Open now */}
        <div className="ecard__opennow">
          <OpenNowBadge workingHours={business.workingHours} />
        </div>
      </div>

      {/* Body */}
      <div className="ecard__body">
        <div className="ecard__type-row">
          <span className="ecard__type">
            {TYPE_EMOJI[business.type]} {TYPE_LABEL[business.type]}
          </span>
          {business.score !== undefined && business.score > 0 && (
            <span className="ecard__score">★ {(business.score * 5).toFixed(1)}</span>
          )}
        </div>

        <h3 className="ecard__name">{business.name}</h3>
        <span className="ecard__area">📍 {business.area}</span>

        {hook && <p className="ecard__hook">{hook}</p>}
      </div>
    </a>
  )
}
