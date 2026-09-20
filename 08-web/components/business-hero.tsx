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
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % slides.length), 3500)
    return () => clearInterval(t)
  }, [slides.length])

  const currentSlide = slides[slideIdx] ?? null
  const Icon = TYPE_ICON[business.type]

  return (
    <section className="bhero">
      <div className={`bhero__inner ${slides.length > 0 ? 'has-cover' : ''}`}>
        <div
          className="bhero__cover"
          style={currentSlide ? { backgroundImage: `url(${currentSlide})` } : undefined}
        >
          {slides.length > 0 && <div className="bhero__cover-overlay" aria-hidden />}
          <div className="bhero__cover-glow" aria-hidden />
          {slides.length === 0 && (
            <span className="bhero__icon" aria-hidden>
              <Icon />
            </span>
          )}
          {slides.length > 0 && (
            <span className="bhero__cover-badge e-badge e-badge--accent" aria-hidden>
              <Icon />
            </span>
          )}
          {slides.length > 1 && (
            <div className="bhero__dots">
              {slides.map((_, i) => (
                <span key={i} className={`bhero__dot ${i === slideIdx ? 'is-active' : ''}`} />
              ))}
            </div>
          )}
        </div>

        <div className="bhero__info">
          <h1 className="bhero__name e-gradient">{business.name}</h1>

          <div className="bhero__meta">
            <span className="bhero__meta-item e-badge e-badge--accent">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.area}
            </span>
            <span className={`bhero__meta-item bhero__meta-item--status ${business.open ? 'is-open' : 'is-closed'}`}>
              <span className="bhero__status-dot" aria-hidden />
              {business.open ? 'مفتوح دلوقتي' : 'مقفول حالياً'}
            </span>
            {stats.review_count > 0 && (
              <span className="bhero__meta-item e-badge e-badge--accent">
                <span className="bhero__star">★</span>
                <strong>{stats.avg_rating.toFixed(1)}</strong>
                <span className="bhero__count">({stats.review_count})</span>
              </span>
            )}
            {stats.active_offers > 0 && (
              <span className="bhero__meta-item bhero__meta-item--offer e-badge e-badge--accent">
                {stats.active_offers} عرض نشط
              </span>
            )}
          </div>

          {business.address && (
            <p className="bhero__address">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', marginLeft: 6, verticalAlign: 'middle' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {business.address}
            </p>
          )}

          <p className="bhero__reason">{business.reason}</p>
        </div>
      </div>
    </section>
  )
}
