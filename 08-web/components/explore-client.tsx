'use client'
import { useState, useMemo } from 'react'
import ExploreCard from './explore-card'
import SearchBar from './search-bar'
import './explore-client.css'

type Business = {
  slug: string
  name: string
  type: 'restaurant' | 'pharmacy' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  score?: number
  [key: string]: any
}

const TYPES = [
  { key: 'all', label: 'الكل', emoji: '✨' },
  { key: 'restaurant', label: 'مطاعم', emoji: '🍽️' },
  { key: 'pharmacy', label: 'صيدليات', emoji: '💊' },
  { key: 'delivery_office', label: 'توصيل', emoji: '🛵' },
]

export default function ExploreClient({
  businesses,
  initialType,
}: {
  businesses: Business[]
  initialType?: string
}) {
  const [activeType, setActiveType] = useState<string>(initialType ?? 'all')
  const [sort, setSort] = useState<'default' | 'rating' | 'reviews'>('default')

  const filtered = useMemo(() => {
    let list = businesses
    if (activeType !== 'all') list = list.filter(b => b.type === activeType)
    if (sort === 'rating') list = [...list].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    if (sort === 'reviews') list = [...list].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
    return list
  }, [businesses, activeType, sort])

  return (
    <section className="exc">
      <div className="exc__filters">
        <SearchBar placeholder="ابحث في الأماكن..." />
      </div>

      <div className="exc__chips">
        {TYPES.map(t => (
          <button
            key={t.key}
            type="button"
            className={`exc__chip ${activeType === t.key ? 'is-active' : ''}`}
            onClick={() => setActiveType(t.key)}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="exc__sort">
        <button
          type="button"
          className={`exc__sort-btn ${sort === 'default' ? 'is-active' : ''}`}
          onClick={() => setSort('default')}
        >الافتراضي</button>
        <button
          type="button"
          className={`exc__sort-btn ${sort === 'rating' ? 'is-active' : ''}`}
          onClick={() => setSort('rating')}
        >الأعلى تقييمًا</button>
        <button
          type="button"
          className={`exc__sort-btn ${sort === 'reviews' ? 'is-active' : ''}`}
          onClick={() => setSort('reviews')}
        >الأكثر تفاعلًا</button>
      </div>

      {filtered.length === 0 ? (
        <div className="exc__empty">
          <span className="exc__empty-emoji">🔍</span>
          <p>مفيش نتايج — جرّب نوع تاني</p>
        </div>
      ) : (
        <div className="exc__grid">
          {filtered.map((b, i) => (
            <div
              key={b.slug}
              className={`exc__item ${i === 0 ? 'exc__item--hero' : ''} ${b.badge === 'مميز' ? 'exc__item--featured' : ''}`}
            >
              <ExploreCard business={b} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
