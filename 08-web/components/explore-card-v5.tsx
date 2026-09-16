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

const TYPE_EMOJI: Record<string, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
}

const TYPE_GRADIENT: Record<string, string> = {
  restaurant: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  pharmacy: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
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
  const allImages = cover ? [cover, ...gallery] : gallery

  useEffect(() => {
    if (!flipped || allImages.length <= 1) return
    intervalRef.current = setInterval(() => {
      setGalleryIdx((i) => (i + 1) % allImages.length)
    }, 2200)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [flipped, allImages.length])

  function enter() {
    setFlipped(true)
    setGalleryIdx(0)
  }
  function leave() {
    setFlipped(false)
  }

  const rating = business.avg_rating ?? business.rating ?? 0
  const reviews = business.review_count ?? business.reviewCount ?? 0
  const offers = business.activeOffers ?? 0
  const hook = HOOK_BY_TYPE[business.type] ?? 'اكتشف المكان'
  const emoji = TYPE_EMOJI[business.type] ?? '📍'
  const typeLabel = TYPE_LABEL[business.type] ?? 'مكان'
  const gradient = TYPE_GRADIENT[business.type] ?? TYPE_GRADIENT.restaurant

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className={`ec5 ${flipped ? 'is-flipped' : ''}`}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onTouchStart={enter}
      onTouchEnd={leave}
      aria-label={business.name}
    >
      <div className="ec5__inner">
        <div className="ec5__front">
          <div
            className="ec5__cover"
            style={{
              backgroundImage: cover ? `url(${cover})` : gradient,
            }}
          >
            {!cover && <span className="ec5__cover-emoji">{emoji}</span>}
          </div>

          {business.badge && <span className="ec5__badge">{business.badge}</span>}
          {offers > 0 && <span className="ec5__offer-badge">🔥 {offers}</span>}

          <div className="ec5__fav">
            <FavoriteButton businessId={business.id ?? business.slug} size="sm" />
          </div>

          <div className="ec5__front-foot">
            <h3 className="ec5__name">{business.name}</h3>
            <span className="ec5__meta">
              {emoji} {typeLabel}
              {business.area ? ` · ${business.area}` : ''}
            </span>
          </div>
        </div>

        <div className="ec5__back">
          {allImages.length > 0 ? (
            <div className="ec5__gallery">
              {allImages.map((url, i) => (
                <div
                  key={i}
                  className={`ec5__gallery-img ${i === galleryIdx ? 'is-active' : ''}`}
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>
          ) : (
            <div className="ec5__gallery-empty" style={{ background: gradient }}>
              <span>{emoji}</span>
            </div>
          )}

          <div className="ec5__gallery-overlay" />

          <div className="ec5__back-content">
            <h3 className="ec5__back-name">{business.name}</h3>

            <div className="ec5__stats">
              {rating > 0 && (
                <span className="ec5__stat">
                  ⭐ {rating.toFixed(1)}
                  {reviews > 0 && <small>({reviews})</small>}
                </span>
              )}
              {business.area && <span className="ec5__stat">📍 {business.area}</span>}
            </div>

            <p className="ec5__hook">{hook}</p>

            <span className="ec5__cta">اكتشف المكان ←</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
