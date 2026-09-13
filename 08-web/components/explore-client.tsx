'use client'
import { useState, useMemo } from 'react'
import ExploreCard from './explore-card'
import './explore-client.css'

type Business = {
  slug: string
  name: string
  type: 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  [key: string]: any
}

const TYPES = [
  { key: 'all', label: 'الكل', emoji: '✨' },
  { key: 'restaurant', label: 'مطاعم', emoji: '🍽️' },
  { key: 'pharmacy', label: 'صيدليات', emoji: '💊' },
  { key: 'delivery_office', label: 'توصيل', emoji: '🛵' },
]

const SORTS = [
  { key: 'default', label: 'الافتراضي' },
  { key: 'rating', label: 'الأعلى تقييمًا' },
  { key: 'reviews', label: 'الأكثر تفاعلًا' },
  { key: 'open', label: 'المفتوح الآن' },
]

export default function ExploreClient({ businesses, initialType }: { businesses: Business[]; initialType?: string }) {
  const [activeType, setActiveType] = useState<string>(initialType ?? 'all')
  const [sort, setSort] = useState<string>('default')

  const filtered = useMemo(() => {
    let list = businesses
    if (activeType !== 'all') list = list.filter(b => b.type === activeType)
    if (sort === 'rating') list = [...list].sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    if (sort === 'reviews') list = [...list].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0))
    if (sort === 'open') list = [...list].sort((a, b) => (b.open ? 1 : 0) - (a.open ? 1 : 0))
    return list
  }, [businesses, activeType, sort])

  return (
    <section className="exc">
      <div className="exc__bar">
        <div className="exc__chips">
          {TYPES.map(t => (
            <button
              key={t.key}
              type="button"
              className={`exc__chip ${activeType === t.key ? 'is-active' : ''}`}
              onClick={() => setActiveType(t.key)}
            >
              <span className="exc__chip-emoji">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="exc__sort">
          {SORTS.map(s => (
            <button
              key={s.key}
              type="button"
              className={`exc__sort-btn ${sort === s.key ? 'is-active' : ''}`}
              onClick={() => setSort(s.key)}
            >{s.label}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="exc__empty">
          <span className="exc__empty-emoji">🔍</span>
          <p>مفيش نتايج — جرّب نوع تاني</p>
        </div>
      ) : (
        <div className="ecard-grid">
          {filtered.map(b => <ExploreCard key={b.slug} business={b} />)}
        </div>
      )}
    </section>
  )
}
