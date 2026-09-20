'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import FavoriteButton from './favorite-button'
import './explore-card-v5.css'

type Business = {
  id?: string
  slug: string
  name: string
  type: string
  area?: string
  badge?: string
  reason?: string
  open?: boolean
  activeOffers?: number
  avg_rating?: number
  rating?: number
  review_count?: number
  reviewCount?: number
  cover?: string
  cover_url?: string
  cover_image_url?: string
  gallery?: string[]
  [key: string]: any
}

function TypeIcon({ type }: { type: string }) {
  const c = { width: 44, height: 44, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'restaurant') return <svg {...c}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  if (type === 'pharmacy') return <svg {...c}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
  if (type === 'supermarket') return <svg {...c}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
  if (type === 'delivery_office') return <svg {...c}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  return <svg {...c}><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
}

const TYPE_GRADIENT: Record<string, string> = {
  restaurant: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  pharmacy: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
  supermarket: 'linear-gradient(135deg, #F59E0B 0%, #DC2626 100%)',
  delivery_office: 'linear-gradient(135deg, #A855F7 0%, #6B21FF 100%)',
}

const HOOK_BY_TYPE: Record<string, string> = {
  restaurant: 'نفسك في إيه؟',
  pharmacy: 'قرب منك وقت الحاجة',
  supermarket: 'البيت محتاج إيه؟',
  delivery_office: 'طلبك في السكة',
}

export default function ExploreCardV5({ business }: { business: Business }) {
  const [flipped, setFlipped] = useState(false)
  const [galleryIdx, setGalleryIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cover = business.cover || business.cover_url || business.cover_image_url || ''
  const gallery: string[] = (business.gallery ?? []).filter(Boolean)
  const allImages = cover ? [cover, ...gallery.filter(g => g !== cover)] : gallery

  useEffect(() => {
    if (!flipped || allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setGalleryIdx((i) => (i + 1) % allImages.length)
    }, 2200)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [flipped, allImages.length])

  const enter = () => setFlipped(true)
  const leave = () => setFlipped(false)

  const rating = business.avg_rating ?? business.rating ?? 0
  const reviews = business.review_count ?? business.reviewCount ?? 0
  const offers = business.activeOffers ?? 0
  const hook = HOOK_BY_TYPE[business.type] ?? 'اكتشف المكان'
  const typeLabel = TYPE_LABEL[business.type] ?? 'مكان'
  const gradient = TYPE_GRADIENT[business.type] ?? TYPE_GRADIENT.restaurant

  return (
    <Link
      href={`/businesses/${encodeURIComponent(business.slug)}`}
      className={`ec5 ${flipped ? 'is-flipped' : ''}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchStart={enter}
      onTouchEnd={leave}
      aria-label={business.name}
    >
      <div className="ec5__inner">
        <div className="ec5__front">
          <div className="ec5__cover" style={{ backgroundImage: cover ? `url(${cover})` : gradient }}>
            {!cover && <span className="ec5__cover-icon" aria-hidden><TypeIcon type={business.type} /></span>}
          </div>

          {business.badge && <span className="ec5__badge">{business.badge}</span>}
          {offers > 0 && <span className="ec5__offer-badge">+{offers}</span>}

          <div className="ec5__fav">
            <FavoriteButton businessId={business.id ?? business.slug} size="sm" />
          </div>

          <div className="ec5__front-foot">
            <h3 className="ec5__name">{business.name}</h3>
            <span className="ec5__meta">
              {typeLabel}{business.area ? ` · ${business.area}` : ''}
            </span>
          </div>
        </div>

        <div className="ec5__back">
          {allImages.length > 0 ? (
            <div className="ec5__gallery">
              {allImages.map((url, i) => (
                <div key={i} className={`ec5__gallery-img ${i === galleryIdx ? 'is-active' : ''}`} style={{ backgroundImage: `url(${url})` }} />
              ))}
            </div>
          ) : (
            <div className="ec5__gallery-empty" style={{ background: gradient }}>
              <TypeIcon type={business.type} />
            </div>
          )}

          <div className="ec5__gallery-overlay" />

          <div className="ec5__back-content">
            <h3 className="ec5__back-name">{business.name}</h3>
            <div className="ec5__stats">
              {rating > 0 && <span className="ec5__stat">★ {rating.toFixed(1)}{reviews > 0 && <small> ({reviews})</small>}</span>}
              {business.area && <span className="ec5__stat">{business.area}</span>}
            </div>
            <p className="ec5__hook">{hook}</p>
            <span className="ec5__cta">اكتشف المكان ←</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
