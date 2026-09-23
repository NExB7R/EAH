import Link from 'next/link'
import './simple-flip-card.css'

/* ═══ Icons ═══ */
function IPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function IStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" aria-hidden>
      <polygon points="12 2 15 9 22 9.3 17 14 18.5 21 12 17.3 5.5 21 7 14 2 9.3 9 9" />
    </svg>
  )
}

function ICrown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 18h20l-2-9-5 4-3-7-3 7-5-4z" />
    </svg>
  )
}

function IGift() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
      <path d="M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5" />
    </svg>
  )
}

function ICompass() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polygon points="16 8 14 14 8 16 10 10 16 8" />
    </svg>
  )
}

function IShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}

function IWhatsapp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  )
}

function IBuilding() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01" />
    </svg>
  )
}

/* ═══ Types ═══ */
export type SimpleBusiness = {
  slug: string
  name: string
  type?: string
  sub_category?: string
  area?: string
  cover?: string
  cover_url?: string
  cover_image_url?: string
  logo?: string
  logo_url?: string
  badge?: string
  activeOffers?: number
  open?: boolean
  rating?: number
  avg_rating?: number
  review_count?: number
  reviewCount?: number
  trust_score?: number
  supports_whatsapp?: boolean
  whatsapp?: string
  hook?: string
  reason?: string
  branches?: { id: string }[]
  [key: string]: any
}

type Props = {
  business: SimpleBusiness
  variant?: 'featured' | 'trending' | 'offers' | 'new' | 'default' | 'grid'
  rank?: number
}

function getCover(b: SimpleBusiness): string {
  return b.cover || b.cover_url || b.cover_image_url || ''
}

function getLogo(b: SimpleBusiness): string {
  return b.logo || b.logo_url || ''
}

function getRating(b: SimpleBusiness): number {
  return b.avg_rating ?? b.rating ?? 0
}

function getReviews(b: SimpleBusiness): number {
  return b.review_count ?? b.reviewCount ?? 0
}

function getTrust(b: SimpleBusiness): number {
  if (typeof b.trust_score === 'number') return b.trust_score
  return Math.min(100, Math.round(getRating(b) * 20))
}

function getTypeLabel(type?: string): string {
  if (type === 'restaurant') return 'مطعم'
  if (type === 'pharmacy') return 'صيدلية'
  if (type === 'delivery_office') return 'توصيل'
  if (type === 'supermarket') return 'ماركت'
  if (type === 'misc') return 'متجر'
  return 'مكان'
}

function getHook(b: SimpleBusiness): string {
  if (b.hook) return b.hook
  if (b.reason) return b.reason
  if (b.type === 'restaurant') return 'نفسك في إيه؟'
  if (b.type === 'pharmacy') return 'قرب منك وقت الحاجة'
  if (b.type === 'delivery_office') return 'طلبك في السكة'
  if (b.type === 'supermarket') return 'البيت محتاج إيه؟'
  if (b.type === 'misc') return 'اكتشف كل حاجة'
  return 'اكتشف المكان'
}

function hasWhatsApp(b: SimpleBusiness): boolean {
  if (typeof b.supports_whatsapp === 'boolean') return b.supports_whatsapp
  return Boolean(b.whatsapp)
}

export default function SimpleFlipCard({ business, variant = 'default', rank }: Props) {
  const cover = getCover(business)
  const logo = getLogo(business)
  const rating = getRating(business)
  const reviews = getReviews(business)
  const trust = getTrust(business)
  const hook = getHook(business)
  const typeLabel = getTypeLabel(business.type)
  const isOpen = typeof business.open === 'boolean' ? business.open : null
  const wa = hasWhatsApp(business)
  const branchesCount = Array.isArray(business.branches) ? business.branches.length : 0

  const href = `/businesses/${encodeURIComponent(business.slug)}`

  return (
    <Link href={href} className={`sfc sfc--${variant}`}>
      <div className="sfc__cover">
        {/* Cover image */}
        <div
          className="sfc__cover-img"
          style={cover ? { backgroundImage: `url(${cover})` } : undefined}
        />

        {/* Logo overlay — instant on hover */}
        <div className="sfc__logo-layer" aria-hidden>
          {logo ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={logo} alt="" className="sfc__logo-img" loading="lazy" />
          ) : (
            <span className="sfc__logo-letter">
              {business.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="sfc__cover-grad" />

        {business.badge === 'مميز' ? (
          <span className="sfc__badge"><ICrown /> مميز</span>
        ) : typeof rank === 'number' ? (
          <span className="sfc__badge">#{rank}</span>
        ) : business.activeOffers && business.activeOffers > 0 ? (
          <span className="sfc__badge"><IGift /> عرض</span>
        ) : null}

        {isOpen !== null && (
          <span className={`sfc__status sfc__status--${isOpen ? 'open' : 'closed'}`}>
            <span className="sfc__status-dot" />
            {isOpen ? 'مفتوح' : 'مغلق'}
          </span>
        )}
      </div>

      <div className="sfc__body">
        <h3 className="sfc__name">{business.name}</h3>
        <p className="sfc__hook">{hook}</p>

        <div className="sfc__meta">
          <span className="sfc__chip">
            <ICompass />
            {typeLabel}
          </span>
          {rating > 0 && (
            <span className="sfc__chip sfc__chip--rating">
              <IStar />
              {rating.toFixed(1)}
              {reviews > 0 && ` (${reviews})`}
            </span>
          )}
          {business.area && (
            <span className="sfc__chip">
              <IPin />
              {business.area}
            </span>
          )}
        </div>

        {trust > 0 && (
          <div className="sfc__trust">
            <span className="sfc__trust-icon"><IShield /></span>
            <span className="sfc__trust-label">مصداقية</span>
            <div className="sfc__trust-bar">
              <div className="sfc__trust-fill" style={{ width: `${trust}%` }} />
            </div>
            <span className="sfc__trust-val">{trust}%</span>
          </div>
        )}

        {(branchesCount > 0 || wa) && (
          <div className="sfc__footer">
            {branchesCount > 0 && (
              <span className="sfc__tag">
                <IBuilding />
                {branchesCount} {branchesCount === 1 ? 'فرع' : 'فروع'}
              </span>
            )}
            {wa && (
              <span className="sfc__tag sfc__tag--wa">
                <IWhatsapp />
                أوردرات
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
