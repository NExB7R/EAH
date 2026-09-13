'use client'
import './explore-card.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
type CardSize = 'hero' | 'lg' | 'md'

type Business = {
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  score?: number
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'سوبر ماركت',
  delivery_office: 'توصيل',
}

const TYPE_HUE: Record<BusinessType, string> = {
  restaurant: '#FF7A3D',
  pharmacy: '#4ADE80',
  supermarket: '#A855F7',
  delivery_office: '#E8C79A',
}

export default function ExploreCard({
  business,
  size = 'md',
}: {
  business: Business
  size?: CardSize
}) {
  return (
    <a
      href={`/businesses/${business.slug}`}
      className={`ecard ecard--${size}`}
      aria-label={business.name}
      style={{ '--hue': TYPE_HUE[business.type] } as React.CSSProperties}
    >
      {/* شريط أكسنت علوي */}
      <span className="ecard__accent" aria-hidden />

      <div className="ecard__inner">
        {/* Top row */}
        <div className="ecard__top">
          <span className="ecard__type">
            {TYPE_EMOJI[business.type]} {TYPE_LABEL[business.type]}
          </span>
          <span className={`ecard__live ${business.open ? 'is-on' : 'is-off'}`}>
            <span className="ecard__live-dot" />
          </span>
        </div>

        {/* Emoji */}
        <div className="ecard__visual">
          <span className="ecard__emoji">{TYPE_EMOJI[business.type]}</span>
        </div>

        {/* Info */}
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

      {business.badge && <span className="ecard__badge">{business.badge}</span>}
    </a>
  )
}
