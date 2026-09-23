'use client'
import Link from 'next/link'
import { useState } from 'react'
import './simple-flip-card.css'

/* ═══ Inline Icons ═══ */
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

function IClock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </svg>
  )
}

function IArrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

/* ═══ Types ═══ */
export type SimpleBusiness = {
  slug: string
  name: string
  type?: string
  area?: string
  cover?: string
  cover_url?: string
  cover_image_url?: string
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
  [key: string]: any
}

type Props = {
  business: SimpleBusiness
  variant?: 'featured' | 'trending' | 'offers' | 'new' | 'default' | 'grid'
  rank?: number
}

/* ═══ Helpers ═══ */
function getCover(b: SimpleBusiness): string {
  return b.cover || b.cover_url || b.cover_image_url || ''
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

/* ═══ Component ═══ */
export default function SimpleFlipCard({ business, variant = 'default', rank }: Props) {
  const [flipped, setFlipped] = useState(false)

  const cover = getCover(business)
  const rating = getRating(business)
  const reviews = getReviews(business)
  const trust = getTrust(business)
  const hook = getHook(business)
  const typeLabel = getTypeLabel(business.type)
  const isOpen = typeof business.open === 'boolean' ? business.open : null
  const wa = hasWhatsApp(business)

  const href = `/businesses/${encodeURIComponent(business.slug)}`

  /* ═══ 3 Facts — الأهم ═══ */
  const facts = []

  // 1. Rating
  facts.push({
    key: 'rating',
    icon: <IStar />,
    label: 'التقييم',
    value: rating > 0 ? `${rating.toFixed(1)} ★` + (reviews > 0 ? ` (${reviews})` : '') : 'جديد',
  })

  // 2. Area
  if (business.area) {
    facts.push({
      key: 'area',
      icon: <IPin />,
      label: 'المنطقة',
      value: business.area,
    })
  }

  // 3. Trust أو WhatsApp أو Offers
  if (trust > 0) {
    facts.push({
      key: 'trust',
      icon: <IShield />,
      label: 'مصداقية',
      value: `${trust}%`,
    })
  } else if (business.activeOffers && business.activeOffers > 0) {
    facts.push({
      key: 'offers',
      icon: <IGift />,
      label: 'عروض',
      value: `${business.activeOffers} عرض`,
    })
  } else {
    facts.push({
      key: 'status',
      icon: <IClock />,
      label: 'الحالة',
      value: isOpen === true ? 'مفتوح' : isOpen === false ? 'مغلق' : wa ? 'واتساب متاح' : 'متاح',
    })
  }

  return (
    <div
      className={`sfc sfc--${variant} ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((v) => !v)}
    >
      <div className="sfc__inner">

        {/* ═══ FRONT ═══ */}
        <Link
          href={href}
          className="sfc__face sfc__front"
          onClick={(e) => {
            // لو على موبايل → نقلب بدل ما ننقل
            if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
              e.preventDefault()
              setFlipped(true)
            }
          }}
        >
          <div
            className="sfc__img"
            style={cover ? { backgroundImage: `url(${cover})` } : undefined}
          />
          <div className="sfc__grad" />

          {/* Badge */}
          {business.badge === 'مميز' ? (
            <span className="sfc__badge"><ICrown /> مميز</span>
          ) : typeof rank === 'number' ? (
            <span className="sfc__badge">#{rank}</span>
          ) : business.activeOffers && business.activeOffers > 0 ? (
            <span className="sfc__badge"><IGift /> عرض</span>
          ) : null}

          {/* Status */}
          {isOpen !== null && (
            <span className={`sfc__status sfc__status--${isOpen ? 'open' : 'closed'}`}>
              <span className="sfc__status-dot" />
              {isOpen ? 'مفتوح' : 'مغلق'}
            </span>
          )}

          {/* Info */}
          <div className="sfc__info">
            <h3 className="sfc__name">{business.name}</h3>
            <p className="sfc__hook">{hook}</p>
            <div className="sfc__chips">
              <span className="sfc__chip">
                <ICompass />
                {typeLabel}
              </span>
              {rating > 0 && (
                <span className="sfc__chip sfc__chip--rating">
                  <IStar />
                  {rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </Link>

        {/* ═══ BACK ═══ */}
        <div className="sfc__face sfc__back">
          <div className="sfc__back-head">
            <h4 className="sfc__back-name">{business.name}</h4>
            <span className="sfc__back-type">{typeLabel}</span>
          </div>

          <p className="sfc__back-hook">{hook}</p>

          <div className="sfc__facts">
            {facts.slice(0, 3).map((f) => (
              <div key={f.key} className="sfc__fact">
                <span className="sfc__fact-icon">{f.icon}</span>
                <div className="sfc__fact-body">
                  <span className="sfc__fact-label">{f.label}</span>
                  <span className="sfc__fact-value">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href={href}
            className="sfc__cta"
            onClick={(e) => e.stopPropagation()}
          >
            اكتشف المكان
            <IArrow />
          </Link>
        </div>
      </div>
    </div>
  )
}
