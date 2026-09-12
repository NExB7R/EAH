'use client'
import './business-card-v2.css'

type Business = {
  slug: string
  name: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
}

const TYPE_EMOJI: Record<Business['type'], string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

export default function BusinessCardV2({ business }: { business: Business }) {
  const { slug, name, type, area, badge, vibe, reason, open } = business
  const href = `/businesses/${slug}`

  return (
    <a href={href} className="bcard" aria-label={name}>
      <div className="bcard__cover">
        <span className="bcard__emoji">{TYPE_EMOJI[type]}</span>
        {badge && <span className="bcard__badge">{badge}</span>}
        <span className={`bcard__open ${open ? 'is-open' : 'is-closed'}`}>
          {open ? '● مفتوح' : '● مغلق'}
        </span>
      </div>
      <div className="bcard__body">
        <h3 className="bcard__name">{name}</h3>
        <p className="bcard__area">{area}</p>
        <div className="bcard__vibes">
          {vibe.slice(0, 3).map((v) => (
            <span key={v} className="bcard__vibe">{v}</span>
          ))}
        </div>
        <p className="bcard__reason">{reason}</p>
      </div>
    </a>
  )
}
