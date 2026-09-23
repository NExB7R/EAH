'use client'
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FavoriteButton from './favorite-button'
import OpenNowBadge from './open-now-badge'
import './explore-card-v5.css'
import { ESticker } from './stickers'

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
  menu?: string[]
  logo?: string
  [key: string]: any
}

function TypeIcon({ type }: { type: string }) {
  const c = { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (type === 'restaurant') return <svg {...c}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
  if (type === 'pharmacy') return <svg {...c}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>
  if (type === 'supermarket') return <svg {...c}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12.5a2 2 0 0 0 2 1.5h8.5a2 2 0 0 0 2-1.6L22 7H6"/></svg>
  if (type === 'delivery_office') return <svg {...c}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
  return <svg {...c}><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>
}

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'ماركت',
  delivery_office: 'توصيل',
  misc: 'أنشطة أخرى',
}

const TYPE_GRADIENT: Record<string, string> = {
  restaurant: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  pharmacy: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)',
  supermarket: 'linear-gradient(135deg, #00D9B8 0%, #0F766E 100%)',
  delivery_office: 'linear-gradient(135deg, #A855F7 0%, #6B21FF 100%)',
}

const HOOK_BY_TYPE: Record<string, string> = {
  restaurant: 'نفسك في إيه؟',
  pharmacy: 'قرب منك وقت الحاجة',
  supermarket: 'البيت محتاج إيه؟',
  delivery_office: 'طلبك في السكة',
  misc: 'اكتشف كل حاجة',
}

function ExploreCardV5Base({ business }: { business: Business }) {
  const [flipped, setFlipped] = useState(false)
  const [slideIdx, setSlideIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cover = business.cover || business.cover_url || business.cover_image_url || ''
  const logo = business.logo || ''
  const gallery = (business.gallery ?? []).filter(Boolean).filter((g) => g !== cover)
  const menu = (business.menu ?? []).filter(Boolean)

  // ترتيب الشرائح: 1) لوجو  2) غلاف  3) منيو  4) صور
  const slides: { url: string; label: string }[] = []
  if (logo) slides.push({ url: logo, label: 'لوجو' })
  if (cover) slides.push({ url: cover, label: business.name })
  menu.forEach((url, i) => slides.push({ url, label: `منيو ${i + 1}` }))
  gallery.forEach((url, i) => slides.push({ url, label: `صورة ${i + 1}` }))

  useEffect(() => {
    if (!flipped || slides.length <= 1) return
    // لا تبديل تلقائي للصور مع تقليل الحركة
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    timerRef.current = setInterval(() => {
      setSlideIdx((i) => (i + 1) % slides.length)
    }, 3000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [flipped, slides.length])

  useEffect(() => {
    if (!flipped) setSlideIdx(0)
  }, [flipped])

  const enter = () => setFlipped(true)
  const leave = () => setFlipped(false)

  const rating = business.avg_rating ?? business.rating ?? 0
  const reviews = business.review_count ?? business.reviewCount ?? 0
  const offers = business.activeOffers ?? 0
  const hook = HOOK_BY_TYPE[business.type] ?? 'اكتشف المكان'
  const typeLabel = TYPE_LABEL[business.type] ?? 'مكان'
  const gradient = TYPE_GRADIENT[business.type] ?? TYPE_GRADIENT.restaurant
  const ageInDays: number = business.ageInDays ?? business.age_in_days ?? 999
  const recentViews: number = business.recentViews ?? business.recent_views ?? 0
  const isNew = ageInDays < 7
  const isTrending = recentViews >= 50
  const hasStickers = isNew || isTrending

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
        {/* ═══ FRONT — الغلاف ═══ */}
        <div className="ec5__front">
          <div className="ec5__cover" style={{ backgroundImage: cover ? `url(${cover})` : gradient }}>
            {!cover && <span className="ec5__cover-icon" aria-hidden><TypeIcon type={business.type} /></span>}
          </div>


          {logo && (
            <div className="ec5__logo" aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={logo} alt="" width={60} height={60} sizes="60px" loading="lazy" />
            </div>
          )}

          {hasStickers && (
            <div className="ec5__stickers" aria-hidden>
              {isNew && <ESticker variant="new" size="sm" rotate={-8} />}
              {isTrending && <ESticker variant="trending" size="sm" rotate={6} />}
            </div>
          )}

          <div className="ec5__open">
            <OpenNowBadge workingHours={business.workingHours} />
          </div>

          <div className="ec5__fav" onClick={(e) => e.preventDefault()}>
            <FavoriteButton businessId={business.id ?? business.slug} size="sm" />
          </div>

          <div className="ec5__front-foot">
            <h3 className="ec5__name">{business.name}</h3>
            <span className="ec5__meta">
              {typeLabel}{business.area ? ` · ${business.area}` : ''}
            </span>
          </div>
        </div>

        {/* ═══ BACK — سلايدر (منيو + صور) ═══ */}
        <div className="ec5__back">
          {slides.length > 0 ? (
            <div className="ec5__gallery">
              {slides.map((s, i) => (
                <div
                  key={i}
                  className={`ec5__gallery-img ${i === slideIdx ? 'is-active' : ''}`}
                  style={{ backgroundImage: `url(${s.url})`, contentVisibility: `auto` }}
                />
              ))}
            </div>
          ) : (
            <div className="ec5__gallery-empty" style={{ background: gradient }}>
              <TypeIcon type={business.type} />
            </div>
          )}

          <div className="ec5__gallery-overlay" />

          {/* مؤشر الصور */}
          {slides.length > 1 && (
            <div className="ec5__dots">
              {slides.map((_, i) => (
                <span key={i} className={`ec5__dot ${i === slideIdx ? 'is-active' : ''}`} />
              ))}
            </div>
          )}

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

export default React.memo(ExploreCardV5Base)
