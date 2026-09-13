'use client'
import { useState, useMemo } from 'react'
import BusinessCardV4 from './business-card-v4'
import { IconSearch } from './neon-icons'
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
  score?: number
  rank?: number
}

const TYPE_LABEL: Record<BusinessType, string> = {
  restaurant: 'مطعم',
  pharmacy: 'صيدلية',
  supermarket: 'سوبر ماركت',
  delivery_office: 'توصيل',
}

const TYPE_EMOJI: Record<BusinessType, string> = {
  restaurant: '🍽️',
  pharmacy: '💊',
  supermarket: '🛒',
  delivery_office: '🛵',
}

type SortKey = 'relevance' | 'rating' | 'open' | 'new'

const SORT_LABELS: Record<SortKey, string> = {
  relevance: 'الأكثر صلة',
  rating: 'الأعلى تقييماً',
  open: 'المفتوح دلوقتي',
  new: 'الأحدث',
}

export default function ExploreClient({ businesses }: { businesses: Business[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<BusinessType | 'all'>('all')
  const [areaFilter, setAreaFilter] = useState<string>('all')
  const [openOnly, setOpenOnly] = useState(false)
  const [sort, setSort] = useState<SortKey>('relevance')

  // قايمة المناطق الفريدة
  const areas = useMemo(() => {
    const set = new Set(businesses.map((b) => b.area))
    return ['all', ...Array.from(set)]
  }, [businesses])

  // الفلترة والترتيب
  const filtered = useMemo(() => {
    let result = [...businesses]

    // بحث
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.vibe.some((v) => v.toLowerCase().includes(q))
      )
    }

    // نوع
    if (typeFilter !== 'all') {
      result = result.filter((b) => b.type === typeFilter)
    }

    // منطقة
    if (areaFilter !== 'all') {
      result = result.filter((b) => b.area === areaFilter)
    }

    // مفتوح فقط
    if (openOnly) {
      result = result.filter((b) => b.open)
    }

    // ترتيب
    switch (sort) {
      case 'rating':
        result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        break
      case 'open':
        result.sort((a, b) => (b.open ? 1 : 0) - (a.open ? 1 : 0))
        break
      case 'new':
        result.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
        break
      case 'relevance':
      default:
        // الترتيب الذكي (الأصلي من الـ ranking)
        break
    }

    return result
  }, [businesses, search, typeFilter, areaFilter, openOnly, sort])

  const activeFilters =
    (search ? 1 : 0) +
    (typeFilter !== 'all' ? 1 : 0) +
    (areaFilter !== 'all' ? 1 : 0) +
    (openOnly ? 1 : 0)

  const resetFilters = () => {
    setSearch('')
    setTypeFilter('all')
    setAreaFilter('all')
    setOpenOnly(false)
    setSort('relevance')
  }

  return (
    <div className="explore">
      {/* ===== Search bar ===== */}
      <div className="explore__search">
        <span className="explore__search-icon" aria-hidden>
          <IconSearch />
        </span>
        <input
          type="text"
          placeholder="ابحث عن اسم، منطقة، أو نوع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="بحث"
        />
        {search && (
          <button
            type="button"
            className="explore__search-clear"
            onClick={() => setSearch('')}
            aria-label="مسح"
          >
            ×
          </button>
        )}
      </div>

      {/* ===== Filter chips ===== */}
      <div className="explore__filters">
        <div className="explore__filter-row">
          <span className="explore__filter-label">النوع:</span>
          <button
            type="button"
            className={`explore__chip ${typeFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            الكل
          </button>
          {(Object.keys(TYPE_LABEL) as BusinessType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={`explore__chip ${typeFilter === t ? 'is-active' : ''}`}
              onClick={() => setTypeFilter(t)}
            >
              {TYPE_EMOJI[t]} {TYPE_LABEL[t]}
            </button>
          ))}
        </div>

        <div className="explore__filter-row">
          <span className="explore__filter-label">المنطقة:</span>
          <select
            className="explore__select"
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
          >
            <option value="all">كل المناطق</option>
            {areas
              .filter((a) => a !== 'all')
              .map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
          </select>

          <button
            type="button"
            className={`explore__toggle ${openOnly ? 'is-active' : ''}`}
            onClick={() => setOpenOnly((v) => !v)}
          >
            <span className="eah-dot" />
            مفتوح دلوقتي
          </button>

          <div className="explore__spacer" />

          <span className="explore__filter-label">ترتيب:</span>
          <select
            className="explore__select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ===== Results header ===== */}
      <div className="explore__results-head">
        <span className="explore__count">
          <strong>{filtered.length}</strong> نتيجة
        </span>
        {activeFilters > 0 && (
          <button type="button" className="explore__reset" onClick={resetFilters}>
            ✕ مسح الفلاتر ({activeFilters})
          </button>
        )}
      </div>

      {/* ===== Grid ===== */}
      {filtered.length > 0 ? (
        <div className="explore__grid">
          {filtered.map((b) => (
            <BusinessCardV4 key={b.slug} business={b} variant={b.type} />
          ))}
        </div>
      ) : (
        <div className="explore__empty">
          <span className="explore__empty-emoji">🔍</span>
          <h3 className="explore__empty-title">مفيش نتائج</h3>
          <p className="explore__empty-msg">جرّب تغيّر الفلاتر أو البحث بكلمة تانية</p>
          <button type="button" className="eah-btn" onClick={resetFilters}>
            مسح الفلاتر
          </button>
        </div>
      )}
    </div>
  )
}
