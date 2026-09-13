'use client'
import { useState } from 'react'
import './explore-card.css'
import FavoriteButton from './favorite-button'
import OpenNowBadge from './open-now-badge'
import './favorite-button.css'
import './open-now-badge.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'delivery_office'
type CardSize = 'hero' | 'lg' | 'md'

type Business = {
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

// هوكات افتراضية — تُستخدم لو مفيش hook مخصص
const DEFAULT_HOOKS: Record<BusinessType, string[]> = {
  restaurant: ['أشهى الأطباق على مزاجك', 'أكل بيتي أصيل', 'طعم يفتح النفس'],
  pharmacy: ['دواك موجود عندنا', 'خدمة سريعة ومحترمة', 'مفتوح وقت ما تحتاج'],
  delivery_office: ['توصيل سريع وآمن', 'تغطية واسعة', 'أمانة في التسليم'],
}

function fallbackHook(type: BusinessType, slug: string): string {
  const list = DEFAULT_HOOKS[type]
  const hash = slug.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  return list[hash % list.length]
}

export default function ExploreCard({
  business,
  size = 'md',
}: {
  business: Business
  size?: CardSize
}) {
  const [hovered, setHovered] = useState(false)
  // الهوك: من DB أولاً، وإلا fallback
  const hook = business.hook?.trim() || fallbackHook(business.type, business.slug)

  return (
    <a
      href={`/businesses/${business.slug}`}
      className={`ecard ecard--${size} ${hovered ? 'is-hovered' : ''}`}
      aria-label={business.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setTimeout(() => setHovered(false), 1500)}
      style={{ '--hue': TYPE_HUE[business.type] } as React.CSSProperties}
    >
      <span className="ecard__accent" aria-hidden />

      <div className="ecard__inner">
        <div className="ecard__top">
          <span className="ecard__type">
            {TYPE_EMOJI[business.type]} {TYPE_LABEL[business.type]}
          </span>
          {business.id && (
            <OpenNowBadge workingHours={business.workingHours} />
          )}
        </div>

        <div className="ecard__visual">
          <span className="ecard__emoji">{TYPE_EMOJI[business.type]}</span>
          {business.id && (
            <div className="ecard__fav">
              <FavoriteButton businessId={business.id} size="sm" />
            </div>
          )}
        </div>

        <div className="ecard__body">
          <h3 className="ecard__name">{business.name}</h3>
          <div className="ecard__meta">
            <span className="ecard__area">{business.area}</span>
            {business.score !== undefined && (
              <span className="ecard__score">★ {(business.score * 5).toFixed(1)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Reveal Panel */}
      <div className="ecard__reveal" aria-hidden>
        <div className="ecard__reveal-inner">
          <span className="ecard__reveal-emoji">{TYPE_EMOJI[business.type]}</span>
          <p className="ecard__reveal-hook">{hook}</p>
          {business.vibe.length > 0 && (
            <div className="ecard__reveal-vibes">
              {business.vibe.slice(0, 3).map((v) => (
                <span key={v} className="ecard__reveal-vibe">#{v}</span>
              ))}
            </div>
          )}
          {business.activeOffers && business.activeOffers > 0 && (
            <span className="ecard__reveal-offer">
              🔥 {business.activeOffers} عرض نشط
            </span>
          )}
          <span className="ecard__reveal-cta">اكتشف المكان ←</span>
        </div>
      </div>

      {business.badge && <span className="ecard__badge">{business.badge}</span>}
    </a>
  )
}
