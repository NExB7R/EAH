import Link from 'next/link'
import './simple-flip-card.css'

/* Cloudinary optimization — إضافة transforms لو مش موجودة */
function optimizeImage(url: string | undefined): string {
  if (!url) return ''
  // لو Cloudinary ومش فيها transforms
  if (url.includes('res.cloudinary.com') && !url.includes('/upload/f_')) {
    return url.replace(
      '/upload/',
      '/upload/f_auto,q_auto,w_400,h_300,c_fill/'
    )
  }
  return url
}


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
function IFire() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2c1 3 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 1-3s-1 1-1 4a5 5 0 1 0 10 0c0-6-6-10-6-10z" />
    </svg>
  )
}
function ISparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l1.6 5.6L19 9l-5.4 1.4L12 16l-1.6-5.6L5 9l5.4-1.4z" />
    </svg>
  )
}
function IWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17L2 22l5.1-1.3A11 11 0 1 0 20.5 3.5zM12 20a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20zm4.5-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1-.6-.2-1.3-.5-2.3-1.4-.7-.6-1.2-1.4-1.4-1.7-.1-.2 0-.3.1-.4l.4-.5c.1-.2.2-.3.3-.4 0-.1 0-.3 0-.4-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.2 1.5.1.5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.2-.4-.2z"/>
    </svg>
  )
}

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
  menu?: string[]
  gallery?: string[]
  badge?: string
  activeOffers?: number
  open?: boolean
  rating?: number
  avg_rating?: number
  review_count?: number
  reviewCount?: number
  trust_score?: number
  hook?: string
  reason?: string
  food_categories?: string[]
  acceptsWhatsappOrders?: boolean
  [key: string]: any
}

type Props = {
  business: SimpleBusiness
  variant?: 'featured' | 'trending' | 'offers' | 'new' | 'default' | 'grid'
  rank?: number
}


/* Cloudinary transforms helper */
function cloudinaryUrl(url: string | undefined, w = 400, h = 300): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com')) return url
  // لو فيها transforms يدوية → نسيبها
  if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url
  return url.replace('/upload/', `/upload/f_auto,q_auto:eco,w_${w},h_${h},c_fill/`)
}

function getCover(b: SimpleBusiness): string {
  return cloudinaryUrl(b.cover || b.cover_url || b.cover_image_url, 400, 300)
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


function phIcon(type?: string) {
  if (type === 'restaurant') return (
    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 2v20M17 2v20M7 8h10M7 14h10" />
    </svg>
  )
  if (type === 'pharmacy') return (
    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="8" width="18" height="10" rx="5" />
      <path d="M12 8v10M8 12h8" />
    </svg>
  )
  if (type === 'delivery_office') return (
    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="18" r="3" />
      <path d="M6 18h6l4-8h4M14 6h4M9 6l3 6" />
    </svg>
  )
  if (type === 'supermarket') return (
    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3h2l2 14h12l2-11H6" />
      <circle cx="9" cy="21" r="1.2" />
      <circle cx="18" cy="21" r="1.2" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3l2.5 6L21 11l-5.5 4L17 21l-5-3-5 3 1.5-6L3 11l6.5-2z" />
    </svg>
  )
}

export default function SimpleFlipCard({ business, variant = 'default', rank }: Props) {
  const cover = getCover(business)
  const rating = getRating(business)
  const reviews = getReviews(business)
  const trust = getTrust(business)
  const hook = getHook(business)
  const typeLabel = getTypeLabel(business.type)
  const isOpen = typeof business.open === 'boolean' ? business.open : null
  const whatsapp = business.acceptsWhatsappOrders === true
  const cat =
    (Array.isArray(business.food_categories) && business.food_categories[0]) ||
    business.sub_category ||
    null
  const href = `/businesses/${encodeURIComponent(business.slug)}`

  let badgeIcon: 'crown' | 'fire' | 'sparkle' | 'gift' | null = null
  let badgeText = ''
  if (business.badge === 'مميز') {
    badgeIcon = 'crown'
    badgeText = 'مميز'
  } else if (variant === 'trending' && typeof rank === 'number') {
    badgeIcon = 'fire'
    badgeText = `#${rank}`
  } else if (variant === 'new') {
    badgeIcon = 'sparkle'
    badgeText = 'جديد'
  } else if (business.activeOffers && business.activeOffers > 0) {
    badgeIcon = 'gift'
    badgeText = 'عرض'
  }

  return (
    <Link href={href} className={`sfc sfc--${variant}`}>
      <div className="sfc__cover">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={business.name}
            className="sfc__img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={`sfc__img sfc__ph sfc__ph--${business.type ?? 'misc'}`}>
            <span className="sfc__ph-icon">{phIcon(business.type)}</span>
            <span className="sfc__ph-label">{typeLabel}</span>
          </div>
        )}
        <div className="sfc__grad" />

        {badgeIcon && (
          <span className={`sfc__badge sfc__badge--${badgeIcon}`}>
            {badgeIcon === 'crown' && <ICrown />}
            {badgeIcon === 'fire' && <IFire />}
            {badgeIcon === 'sparkle' && <ISparkle />}
            {badgeIcon === 'gift' && <IGift />}
            <span>{badgeText}</span>
          </span>
        )}

        {isOpen !== null && (
          <span className={`sfc__status sfc__status--${isOpen ? 'open' : 'closed'}`}>
            <span className="sfc__status-dot" />
            {isOpen ? 'مفتوح' : 'مغلق'}
          </span>
        )}

        {whatsapp && (
          <span className="sfc__wa" title="يستقبل طلبات على واتساب">
            <IWhatsApp />
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
          {cat && <span className="sfc__chip sfc__chip--cat">{cat}</span>}
          {rating > 0 && (
            <span className="sfc__chip sfc__chip--rating">
              <IStar />
              {rating.toFixed(1)}
              {reviews > 0 && <span className="sfc__chip-count">({reviews})</span>}
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
      </div>
    </Link>
  )
}
