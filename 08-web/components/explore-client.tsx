'use client'
import { useState, useMemo, useEffect } from 'react'
import ExploreCard from "./explore-card"
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
  const [sheetOpen, setSheetOpen] = useState(false)

  // منع الـ scroll لما الـ sheet مفتوح
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheetOpen])

  // قايمة المناطق الفريدة
  const areas = useMemo(() => {
    const set = new Set(businesses.map((b) => b.area))
    return Array.from(set).sort()
  }, [businesses])

  // الفلترة والترتيب
  const filtered = useMemo(() => {
    let result = [...businesses]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.area.toLowerCase().includes(q) ||
          b.vibe.some((v) => v.toLowerCase().includes(q))
      )
    }
    if (typeFilter !== 'all') result = result.filter((b) => b.type === typeFilter)
    if (areaFilter !== 'all') result = result.filter((b) => b.area === areaFilter)
    if (openOnly) result = result.filter((b) => b.open)

    switch (sort) {
      case 'rating': result.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); break
      case 'open':   result.sort((a, b) => (b.open ? 1 : 0) - (a.open ? 1 : 0)); break
      case 'new':    result.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0)); break
    }

    return result
  }, [businesses, search, typeFilter, areaFilter, openOnly, sort])

  const activeFilters =
    (typeFilter !== 'all' ? 1 : 0) +
    (areaFilter !== 'all' ? 1 : 0) +
    (openOnly ? 1 : 0)

  const resetFilters = () => {
    setTypeFilter('all')
    setAreaFilter('all')
    setOpenOnly(false)
    setSort('relevance')
  }

  return (
    <div className="explore">

      {/* ===== Top bar: Search + Filter button ===== */}
      <div className="explore__topbar">
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

        <button
          type="button"
          className={`explore__filter-btn ${activeFilters > 0 ? 'is-active' : ''}`}
          onClick={() => setSheetOpen(true)}
          aria-label="فتح الفلاتر"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          فلاتر
          {activeFilters > 0 && (
            <span className="explore__filter-badge">{activeFilters}</span>
          )}
        </button>
      </div>

      {/* ===== Active filters chips (small, inline) ===== */}
      {activeFilters > 0 && (
        <div className="explore__active">
          {typeFilter !== 'all' && (
            <button
              type="button"
              className="explore__active-chip"
              onClick={() => setTypeFilter('all')}
            >
              {TYPE_EMOJI[typeFilter]} {TYPE_LABEL[typeFilter]}
              <span className="explore__active-x">×</span>
            </button>
          )}
          {areaFilter !== 'all' && (
            <button
              type="button"
              className="explore__active-chip"
              onClick={() => setAreaFilter('all')}
            >
              📍 {areaFilter}
              <span className="explore__active-x">×</span>
            </button>
          )}
          {openOnly && (
            <button
              type="button"
              className="explore__active-chip explore__active-chip--live"
              onClick={() => setOpenOnly(false)}
            >
              <span className="eah-dot" />
              مفتوح دلوقتي
              <span className="explore__active-x">×</span>
            </button>
          )}
        </div>
      )}

      {/* ===== Results header ===== */}
      <div className="explore__results-head">
        <span className="explore__count">
          <strong>{filtered.length}</strong> نتيجة
        </span>
        {activeFilters > 0 && (
          <button type="button" className="explore__reset" onClick={resetFilters}>
            مسح الكل
          </button>
        )}
      </div>

      {/* ===== Grid ===== */}
      {filtered.length > 0 ? (
        <div className="explore__grid">
          {filtered.map((b) => (
            <ExploreCard key={b.slug} business={b} />
          ))}
        </div>
      ) : (
        <div className="explore__empty">
          <span className="explore__empty-emoji">🔍</span>
          <h3 className="explore__empty-title">مفيش نتائج</h3>
          <p className="explore__empty-msg">جرّب تغيّر الفلاتر أو البحث بكلمة تانية</p>
          <button type="button" className="eah-btn eah-btn--primary" onClick={resetFilters}>
            مسح الفلاتر
          </button>
        </div>
      )}

      {/* ===== Bottom Sheet Filters ===== */}
      <div
        className={`filter-sheet ${sheetOpen ? 'is-open' : ''}`}
        onClick={() => setSheetOpen(false)}
        aria-hidden={!sheetOpen}
      >
        <div className="filter-sheet__panel" onClick={(e) => e.stopPropagation()}>
          {/* Handle */}
          <div className="filter-sheet__handle" aria-hidden />

          <div className="filter-sheet__head">
            <h3 className="filter-sheet__title">الفلاتر</h3>
            <button
              type="button"
              className="filter-sheet__close"
              onClick={() => setSheetOpen(false)}
              aria-label="إغلاق"
            >
              ×
            </button>
          </div>

          <div className="filter-sheet__body">
            {/* النوع */}
            <div className="filter-group">
              <h4 className="filter-group__title">النوع</h4>
              <div className="filter-group__chips">
                <button
                  type="button"
                  className={`filter-chip ${typeFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setTypeFilter('all')}
                >
                  الكل
                </button>
                {(Object.keys(TYPE_LABEL) as BusinessType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`filter-chip ${typeFilter === t ? 'is-active' : ''}`}
                    onClick={() => setTypeFilter(t)}
                  >
                    {TYPE_EMOJI[t]} {TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* المنطقة */}
            <div className="filter-group">
              <h4 className="filter-group__title">المنطقة</h4>
              <div className="filter-group__chips">
                <button
                  type="button"
                  className={`filter-chip ${areaFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setAreaFilter('all')}
                >
                  الكل
                </button>
                {areas.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`filter-chip ${areaFilter === a ? 'is-active' : ''}`}
                    onClick={() => setAreaFilter(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* الحالة */}
            <div className="filter-group">
              <h4 className="filter-group__title">الحالة</h4>
              <button
                type="button"
                className={`filter-switch ${openOnly ? 'is-on' : ''}`}
                onClick={() => setOpenOnly((v) => !v)}
              >
                <span className="filter-switch__track">
                  <span className="filter-switch__thumb" />
                </span>
                <span className="filter-switch__label">مفتوح دلوقتي فقط</span>
              </button>
            </div>

            {/* الترتيب */}
            <div className="filter-group">
              <h4 className="filter-group__title">الترتيب</h4>
              <div className="filter-group__chips">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    className={`filter-chip ${sort === k ? 'is-active' : ''}`}
                    onClick={() => setSort(k)}
                  >
                    {SORT_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-sheet__foot">
            <button
              type="button"
              className="filter-sheet__reset"
              onClick={resetFilters}
            >
              مسح الفلاتر
            </button>
            <button
              type="button"
              className="filter-sheet__apply"
              onClick={() => setSheetOpen(false)}
            >
              عرض {filtered.length} نتيجة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
