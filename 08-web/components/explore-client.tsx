'use client'
import { useState, useMemo } from 'react'
import ExploreCard from './explore-card'
import './explore-client.css'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

type Business = {
  slug: string
  name: string
  type: BusinessType
  area: string
  badge?: string
  vibe: string[]
  reason: string
  open: boolean
  activeOffers?: number
  is_premium?: boolean
  score?: number
  avg_rating?: number
  review_count?: number
  [key: string]: any
}

const TYPES: { key: BusinessType | 'all'; label: string; emoji: string }[] = [
  { key: 'all', label: 'الكل', emoji: '✨' },
  { key: 'restaurant', label: 'مطاعم', emoji: '🍽️' },
  { key: 'pharmacy', label: 'صيدليات', emoji: '💊' },
  { key: 'supermarket', label: 'ماركت', emoji: '🛒' },
  { key: 'delivery_office', label: 'توصيل', emoji: '🛵' },
]

const SORTS = [
  { key: 'default', label: 'الأنسب ليك', emoji: '✨' },
  { key: 'rating', label: 'الأعلى تقييم', emoji: '⭐' },
  { key: 'views', label: 'الأكثر زيارة', emoji: '👁' },
  { key: 'offers', label: 'فيه عروض', emoji: '🎁' },
  { key: 'new', label: 'الأحدث', emoji: '🌱' },
]

export default function ExploreClient({
  businesses,
  initialType,
}: {
  businesses: Business[]
  initialType?: string
}) {
  const [type, setType] = useState<BusinessType | 'all'>(
    (initialType as BusinessType) ?? 'all'
  )
  const [area, setArea] = useState<string>('all')
  const [sort, setSort] = useState<string>('default')
  const [openOnly, setOpenOnly] = useState(false)
  const [offersOnly, setOffersOnly] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

  // الأماكن المتاحة (dynamic)
  const areas = useMemo(() => {
    const set = new Set<string>()
    businesses.forEach((b) => b.area && set.add(b.area))
    return Array.from(set).sort()
  }, [businesses])

  const filtered = useMemo(() => {
    let list = businesses

    if (type !== 'all') list = list.filter((b) => b.type === type)
    if (area !== 'all') list = list.filter((b) => b.area === area)
    if (openOnly) list = list.filter((b) => b.open)
    if (offersOnly) list = list.filter((b) => (b.activeOffers ?? 0) > 0)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.area?.toLowerCase().includes(q) ||
          b.vibe?.some((v) => v.toLowerCase().includes(q))
      )
    }

    const arr = [...list]
    switch (sort) {
      case 'rating':
        arr.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
        break
      case 'views':
        arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        break
      case 'offers':
        arr.sort((a, b) => (b.activeOffers ?? 0) - (a.activeOffers ?? 0))
        break
      case 'new':
        arr.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        )
        break
      default:
        // featured + premium first
        arr.sort((a, b) => {
          const pa = (a.is_premium ? 2 : 0) + (a.badge === 'مميز' ? 1 : 0)
          const pb = (b.is_premium ? 2 : 0) + (b.badge === 'مميز' ? 1 : 0)
          return pb - pa
        })
    }
    return arr
  }, [businesses, type, area, sort, openOnly, offersOnly, search])

  const activeFiltersCount =
    (type !== 'all' ? 1 : 0) +
    (area !== 'all' ? 1 : 0) +
    (openOnly ? 1 : 0) +
    (offersOnly ? 1 : 0) +
    (search.trim() ? 1 : 0)

  function clearAll() {
    setType('all')
    setArea('all')
    setOpenOnly(false)
    setOffersOnly(false)
    setSearch('')
    setSort('default')
  }

  return (
    <section className="exc">
      {/* Search */}
      <div className="exc-search">
        <span className="exc-search__icon">🔎</span>
        <input
          type="search"
          placeholder="ابحث باسم المكان، المنطقة، أو النوع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            className="exc-search__clear"
            onClick={() => setSearch('')}
            aria-label="مسح البحث"
          >
            ×
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="exc-types">
        {TYPES.map((t) => {
          const count =
            t.key === 'all'
              ? businesses.length
              : businesses.filter((b) => b.type === t.key).length
          return (
            <button
              key={t.key}
              type="button"
              className={`exc-type ${type === t.key ? 'is-active' : ''}`}
              onClick={() => setType(t.key)}
            >
              <span className="exc-type__emoji">{t.emoji}</span>
              <span className="exc-type__label">{t.label}</span>
              <span className="exc-type__count">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Filters row */}
      <div className="exc-filters">
        <div className="exc-filters__left">
          {areas.length > 1 && (
            <select
              className="exc-select"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="المنطقة"
            >
              <option value="all">📍 كل المناطق</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            className={`exc-toggle ${openOnly ? 'is-active' : ''}`}
            onClick={() => setOpenOnly((v) => !v)}
          >
            ✅ مفتوح دلوقتي
          </button>

          <button
            type="button"
            className={`exc-toggle ${offersOnly ? 'is-active' : ''}`}
            onClick={() => setOffersOnly((v) => !v)}
          >
            🎁 فيه عروض
          </button>

          {activeFiltersCount > 0 && (
            <button type="button" className="exc-clear" onClick={clearAll}>
              مسح ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="exc-filters__right">
          <select
            className="exc-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="الترتيب"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>

          <div className="exc-view">
            <button
              type="button"
              className={`exc-view__btn ${view === 'grid' ? 'is-active' : ''}`}
              onClick={() => setView('grid')}
              aria-label="عرض شبكة"
            >
              ▦
            </button>
            <button
              type="button"
              className={`exc-view__btn ${view === 'list' ? 'is-active' : ''}`}
              onClick={() => setView('list')}
              aria-label="عرض قائمة"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="exc-count">
        {filtered.length > 0 ? (
          <>
            <span className="exc-count__num">{filtered.length}</span> مكان
            {activeFiltersCount > 0 && (
              <span className="exc-count__hint"> — بعد التصفية</span>
            )}
          </>
        ) : (
          'مفيش نتايج'
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="exc-empty">
          <span className="exc-empty__emoji">🔍</span>
          <h3 className="exc-empty__title">مفيش نتايج</h3>
          <p className="exc-empty__msg">
            جرّب تغير فلتر أو امسح البحث
          </p>
          <button
            type="button"
            className="exc-empty__btn"
            onClick={clearAll}
          >
            🔄 إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className={view === 'grid' ? 'ecard-grid' : 'ecard-list'}>
          {filtered.map((b) => (
            <ExploreCard key={b.slug} business={b} />
          ))}
        </div>
      )}
    </section>
  )
}
