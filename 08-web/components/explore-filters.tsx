"use client"
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import { FOOD_CATEGORIES } from '@/lib/food/categories'
import * as Icons from '@/components/eah-icons'
import './explore-filters.css'

const TYPES = [
  { key: 'all', label: 'الكل', icon: 'M4 6h16M4 12h16M4 18h16' },
  { key: 'restaurant', label: 'مطاعم', icon: 'M7 2v20M7 8h6a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H7M13 2v20' },
  { key: 'pharmacy', label: 'صيدليات', icon: 'M4 8h16v12H4zM8 12h8M12 8V4' },
  { key: 'supermarket', label: 'ماركت', icon: 'M3 3h2l2 14h12l2-10H7M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z' },
  { key: 'delivery_office', label: 'توصيل', icon: 'M5 18h14M5 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM19 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM13 6h4l3 8' },
]

const SORTS = [
  { key: 'quality', label: 'الأعلى تقييماً' },
  { key: 'activity', label: 'الأكثر نشاط' },
  { key: 'new', label: 'الأحدث' },
  { key: 'featured', label: 'المميزين' },
]

export default function ExploreFilters({ total }: { total: number }) {
  const router = useRouter()
  const sp = useSearchParams()
  const [pending, start] = useTransition()
  const [showSort, setShowSort] = useState(false)
  const [showFood, setShowFood] = useState(false)

  const type = sp.get('type') ?? 'all'
  const sort = sp.get('sort') ?? 'quality'
  const food = sp.get('food') ?? null
  const open = sp.get('open') === '1'
  const offers = sp.get('offers') === '1'

  function set(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString())
    if (value === null || value === '' || value === 'all') params.delete(key)
    else params.set(key, value)
    start(() => router.push(`/explore?${params.toString()}`))
  }

  const activeFoods = food ? [food] : []
  const hasFilters = food || open || offers || sort !== 'quality'

  return (
    <div className={`ef ${pending ? 'is-pending' : ''}`}>
      {/* Type tabs */}
      <div className="ef__types" role="tablist">
        {TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={type === t.key}
            className={`ef__type ${type === t.key ? 'is-on' : ''}`}
            onClick={() => set('type', t.key)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={t.icon} />
            </svg>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="ef__row">
        {/* Food category */}
        <div className="ef__dropdown">
          <button
            type="button"
            className={`ef__btn ${food ? 'is-active' : ''}`}
            onClick={() => { setShowFood((v) => !v); setShowSort(false) }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2v20M8 6h8M6 10h12M4 14h16M2 18h20" />
            </svg>
            <span>{food ? FOOD_CATEGORIES.find((c) => c.key === food)?.label ?? 'نوع' : 'نوع الأكل'}</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showFood && (
            <div className="ef__menu">
              <button
                type="button"
                className={`ef__item ${!food ? 'is-on' : ''}`}
                onClick={() => { set('food', null); setShowFood(false) }}
              >
                كل الأنواع
              </button>
              {FOOD_CATEGORIES.map((c) => {
                const iconKey = (Icons as any)['IcFood' + (c.key.charAt(0).toUpperCase() + c.key.slice(1))] ?? (Icons as any).IcSparkle
                const Icon = iconKey
                return (
                  <button
                    key={c.key}
                    type="button"
                    className={`ef__item ${food === c.key ? 'is-on' : ''}`}
                    onClick={() => { set('food', c.key); setShowFood(false) }}
                  >
                    <Icon />
                    <span>{c.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="ef__dropdown">
          <button
            type="button"
            className="ef__btn"
            onClick={() => { setShowSort((v) => !v); setShowFood(false) }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>{SORTS.find((s) => s.key === sort)?.label}</span>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showSort && (
            <div className="ef__menu">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  className={`ef__item ${sort === s.key ? 'is-on' : ''}`}
                  onClick={() => { set('sort', s.key); setShowSort(false) }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggles */}
        <button
          type="button"
          className={`ef__chip ${open ? 'is-on' : ''}`}
          onClick={() => set('open', open ? null : '1')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          مفتوح دلوقتي
        </button>
        <button
          type="button"
          className={`ef__chip ${offers ? 'is-on' : ''}`}
          onClick={() => set('offers', offers ? null : '1')}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v6M5 5l3 4M19 5l-3 4M4 14h16M12 14v8"/></svg>
          فيه عروض
        </button>

        {hasFilters && (
          <button
            type="button"
            className="ef__clear"
            onClick={() => start(() => router.push('/explore'))}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            امسح الفلتر
          </button>
        )}
      </div>

      <p className="ef__count">{total} نتيجة</p>
    </div>
  )
}
