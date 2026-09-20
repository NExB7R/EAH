'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import './business-hero.css'
import { IcRestaurant, IcPharmacy, IcMarket, IcDelivery } from './eah-icons'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

const TYPE_ICON: Record<BusinessType, React.ComponentType> = {
  restaurant: IcRestaurant,
  pharmacy: IcPharmacy,
  delivery_office: IcDelivery,
  supermarket: IcMarket,
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  delivery_office: 'توصيل',
  supermarket: 'ماركت',
}

type Stats = {
  avg_rating: number
  review_count: number
  active_offers: number
}

export default function BusinessHero({
  business,
  stats,
}: {
  business: {
    name: string
    slug: string
    type: BusinessType
    area: string
    reason: string
    open: boolean
    vibe: string[]
    address?: string | null
    workingHours?: any
    coverImage?: string | null
    gallery?: string[]
  }
  stats: Stats
}) {
  const cover = business.coverImage ?? null
  const gallery = business.gallery ?? []
  const slides: string[] = []
  if (cover) slides.push(cover)
  gallery.filter((g) => g !== cover).forEach((g) => slides.push(g))
  const [slideIdx, setSlideIdx] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 4000)
    return () => clearInterval(t)
  }, [slides.length])

  const currentSlide = slides[slideIdx] ?? null
  const Icon = TYPE_ICON[business.type]
  const typeLabel = TYPE_LABEL[business.type]

  return (
    <section className="bh2">
      {/* ═══ Breadcrumbs فوق الصورة ═══ */}
      <nav className="bh2__crumbs" aria-label="breadcrumbs">
        <Link href="/" className="bh2__crumb">الرئيسية</Link>
        <span className="bh2__crumb-sep">›</span>
        <Link href="/explore" className="bh2__crumb">اكتشف</Link>
        <span className="bh2__crumb-sep">›</span>
        <Link href={`/explore?type=${business.type}`} className="bh2__crumb">{typeLabel}</Link>
        <span className="bh2__crumb-sep">›</span>
        <span className="bh2__crumb bh2__crumb--current">{business.name}</span>
      </nav>

      {/* ═══ Cover كامل العرض ═══ */}
      <div className="bh2__cover-wrap">
        <div
          className="bh2__cover"
          style={currentSlide ? { backgroundImage: `url(${currentSlide})` } : undefined}
        >
          {!currentSlide && (
            <span className="bh2__icon-fallback" aria-hidden>
              <Icon />
            </span>
          )}
          <div className="bh2__cover-overlay" aria-hidden />

          {/* Status pill فوق يمين */}
          <span className={`bh2__status ${business.open ? 'is-open' : 'is-closed'}`}>
            <span className="bh2__status-dot" />
            {business.open ? 'مفتوح دلوقتي' : 'مقفول حالياً'}
          </span>

          {/* dots السلايدر */}
          {slides.length > 1 && (
            <div className="bh2__dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`صورة ${i + 1}`}
                  className={`bh2__dot ${i === slideIdx ? 'is-active' : ''}`}
                  onClick={() => setSlideIdx(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ═══ Info Card عائم فوق الصورة ═══ */}
        <div className="bh2__card">
          <div className="bh2__card-head">
            <span className="bh2__type-badge">
              <Icon /> {typeLabel}
            </span>
            {stats.active_offers > 0 && (
              <span className="bh2__offers-badge">{stats.active_offers} عرض نشط</span>
            )}
          </div>

          <h1 className="bh2__name">{business.name}</h1>

          <div className="bh2__meta">
            <span className="bh2__meta-pill">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.area}
            </span>

            {stats.review_count > 0 ? (
              <span className="bh2__meta-pill bh2__meta-pill--rating">
                <span className="bh2__star">★</span>
                <strong>{stats.avg_rating.toFixed(1)}</strong>
                <span className="bh2__reviews-count">({stats.review_count} تقييم)</span>
              </span>
            ) : (
              <span className="bh2__meta-pill bh2__meta-pill--muted">لسه مفيش تقييمات</span>
            )}
          </div>

          {business.reason && (
            <p className="bh2__reason">{business.reason}</p>
          )}

          {business.address && (
            <p className="bh2__address">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle', flexShrink: 0 }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{business.address}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
