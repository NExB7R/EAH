'use client'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import ExploreCard from './explore-card'
import ExploreFilters from './explore-filters'
import { FOOD_CATEGORIES } from '@/lib/food/categories'
import './explore-client.css'
import { IcSearch } from '@/components/eah-icons'

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
  { key: 'all', label: 'الكل', emoji: '' },
  { key: 'restaurant', label: 'مطاعم', emoji: '' },
  { key: 'pharmacy', label: 'صيدليات', emoji: '' },
  { key: 'supermarket', label: 'ماركت', emoji: '' },
  { key: 'delivery_office', label: 'توصيل', emoji: '' },
]

const SORTS = [
  { key: 'default', label: 'الأنسب ليك', emoji: '' },
  { key: 'rating', label: 'الأعلى تقييم', emoji: '' },
  { key: 'views', label: 'الأكثر زيارة', emoji: '' },
  { key: 'offers', label: 'فيه عروض', emoji: '' },
  { key: 'new', label: 'الأحدث', emoji: '' },
]

const VALID_TYPES: BusinessType[] = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office']

export default function ExploreClient({
  businesses,
  initialType,
}: {
  businesses: Business[]
  initialType?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // URL = source of truth
  const rawType = searchParams.get('type') ?? initialType ?? 'all'
  const type: BusinessType | 'all' = VALID_TYPES.includes(rawType as BusinessType)
    ? (rawType as BusinessType)
    : 'all'

  const area = searchParams.get('area') ?? 'all'
  const sort = searchParams.get('sort') ?? 'default'
  const search = searchParams.get('q') ?? ''
  const openOnly = searchParams.get('open') === '1'
  const offersOnly = searchParams.get('offers') === '1'
  const view = (searchParams.get('view') === 'list' ? 'list' : 'grid') as 'grid' | 'list'

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === 'all' || v === 'default' || v === '0') {
        params.delete(k)
      } else {
        params.set(k, v)
      }
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const areas = useMemo(() => {
    const set = new Set<string>()
    businesses.forEach((b) => b.area && set.add(b.area))
    return Array.from(set).sort()
  }, [businesses])

  const [foodCat, setFoodCat] = useState<string | null>(null)
  const filtered = useMemo(() => {
    let list = businesses

    if (type !== 'all') list = list.filter((b) => b.type === type)
    if (foodCat) list = list.filter((b) => (b as Business).food_categories?.includes(foodCat))
    if (area !== 'all') list = list.filter((b) => b.area === area)
    if (openOnly) list = list.filter((b) => b.open)
    if (offersOnly) list = list.filter((b) => (b.activeOffers ?? 0) > 0)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.area?.toLowerCase().includes(q) ||
          b.vibe?.some((v) => v.toLowerCase().includes(q)),
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
        arr.sort((a, b) =>
          new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime(),
        )
        break
      default:
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
    router.replace(pathname, { scroll: false })
  }

  return (
    <section className="exc">
      {/* Search */}
      <div className="exc-search">
        <span className="exc-search__icon"><IcSearch /></span>
        <input
          type="search"
          placeholder="ابحث باسم المكان، المنطقة، أو النوع..."
          value={search}
          onChange={(e) => updateParams({ q: e.target.value })}
        />
        {search && (
          <button
            type="button"
            className="exc-search__clear"
            onClick={() => updateParams({ q: null })}
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
              onClick={() => updateParams({ type: t.key === 'all' ? null : t.key })}
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
              onChange={(e) => updateParams({ area: e.target.value === 'all' ? null : e.target.value })}
              aria-label="المنطقة"
            >
              <option value="all">كل المناطق</option>
              {areas.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            className={`exc-toggle ${openOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ open: openOnly ? null : '1' })}
          >
            مفتوح دلوقتي
          </button>

          <button
            type="button"
            className={`exc-toggle ${offersOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ offers: offersOnly ? null : '1' })}
          >
            فيه عروض
          </button>

          <select
            className="exc-select"
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            aria-label="الترتيب"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>{s.emoji} {s.label}</option>
            ))}
          </select>
        </div>

        <div className="exc-filters__right">
          {activeFiltersCount > 0 && (
            <button type="button" className="exc-clear" onClick={clearAll}>
              ✕ امسح الفلاتر ({activeFiltersCount})
            </button>
          )}

          <div className="exc-view">
            <button
              type="button"
              className={`exc-view__btn ${view === 'grid' ? 'is-active' : ''}`}
              onClick={() => updateParams({ view: null })}
              aria-label="شبكة"
            >
              ▦
            </button>
            <button
              type="button"
              className={`exc-view__btn ${view === 'list' ? 'is-active' : ''}`}
              onClick={() => updateParams({ view: 'list' })}
              aria-label="قائمة"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="exc-empty">
          <span className="exc-empty__emoji"><IcSearch /></span>
          <h3 className="exc-empty__title">مفيش نتائج</h3>
          <p className="exc-empty__msg">جرّب فلتر تاني أو امسح البحث</p>
          <button type="button" className="exc-empty__btn" onClick={clearAll}>
            امسح كل الفلاتر
          </button>
        </div>
      ) : (
        <>
          <p className="exc-count">
            <strong>{filtered.length}</strong> مكان
          </p>
          <div className={`exc-grid ${view === 'list' ? 'exc-grid--list' : ''}`}>
            {filtered.map((b) => (
              <ExploreCard key={b.slug} business={b} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
