'use client'
import { useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import ExploreCard from './explore-card'
import { FOOD_CATEGORIES } from '@/lib/food/categories'
import './explore-client.css'
import { IcClose, IcMenu, IcSearch } from '@/components/eah-icons'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office'

type Business = {
  slug: string
  name: string
  type?: BusinessType
  business_type?: BusinessType
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
  food_categories?: string[]
  [key: string]: any
}

const TYPES = [
  { key: 'all', label: 'الكل' },
  { key: 'restaurant', label: 'مطاعم' },
  { key: 'pharmacy', label: 'صيدليات' },
  { key: 'supermarket', label: 'ماركت' },
  { key: 'delivery_office', label: 'توصيل' },
] as const

const SORTS = [
  { key: 'default', label: 'الأنسب ليك' },
  { key: 'rating', label: 'الأعلى تقييم' },
  { key: 'views', label: 'الأكثر زيارة' },
  { key: 'offers', label: 'فيه عروض' },
  { key: 'new', label: 'الأحدث' },
]

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office']
const getType = (b: Business): string => (b.type ?? b.business_type ?? '') as string

export default function ExploreClient({ businesses, initialType, clientCoords }: { businesses: Business[]; initialType?: string; clientCoords?: { lat: number; lng: number } | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawType = searchParams.get('type') ?? initialType ?? 'all'
  const type = VALID_TYPES.includes(rawType) ? rawType : 'all'
  const area = searchParams.get('area') ?? 'all'
  const sort = searchParams.get('sort') ?? 'default'
  const search = searchParams.get('q') ?? ''
  const foodCat = searchParams.get('food') ?? ''
  const openOnly = searchParams.get('open') === '1'
  const offersOnly = searchParams.get('offers') === '1'
  const view = (searchParams.get('view') === 'list' ? 'list' : 'grid') as 'grid' | 'list'
  const [sortOpen, setSortOpen] = useState(false)
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(clientCoords ?? null)
  const [nearMe, setNearMe] = useState(false)

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === '' || v === 'all' || v === 'default' || v === '0') params.delete(k)
      else params.set(k, v)
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const areas = useMemo(() => {
    const set = new Set<string>()
    businesses.forEach((b) => b.area && set.add(b.area))
    return Array.from(set).sort()
  }, [businesses])

  const availableFoodCats = useMemo(() => {
    const used = new Set<string>()
    businesses.forEach((b) => {
      if (Array.isArray(b.food_categories)) b.food_categories.forEach((c) => used.add(c))
    })
    return FOOD_CATEGORIES.filter((c) => used.has(c.key))
  }, [businesses])

  const filtered = useMemo(() => {
    let list = businesses
    if (type !== 'all') list = list.filter((b) => getType(b) === type)
    if (foodCat) list = list.filter((b) => b.food_categories?.includes(foodCat))
    if (area !== 'all') list = list.filter((b) => b.area === area)
    if (openOnly) list = list.filter((b) => b.open)
    if (offersOnly) list = list.filter((b) => (b.activeOffers ?? 0) > 0)

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((b) =>
        b.name.toLowerCase().includes(q) ||
        b.area?.toLowerCase().includes(q) ||
        b.vibe?.some((v) => v.toLowerCase().includes(q))
      )
    }

    const arr = [...list]
    switch (sort) {
      case 'rating': arr.sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0)); break
      case 'views': arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)); break
      case 'offers': arr.sort((a, b) => (b.activeOffers ?? 0) - (a.activeOffers ?? 0)); break
      case 'new': arr.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()); break
      default:
        arr.sort((a, b) => {
          const pa = (a.is_premium ? 2 : 0) + (a.badge === 'مميز' ? 1 : 0)
          const pb = (b.is_premium ? 2 : 0) + (b.badge === 'مميز' ? 1 : 0)
          return pb - pa
        })
    }
    if (nearMe && userCoords) {
      const withCoords = arr.filter((b) => (b as any).latitude != null && (b as any).longitude != null)
      // لو مفيش أي نشاط عنده إحداثيات → نرجع كل النتائج بدون ترتيب مسافة
      if (withCoords.length > 0) {
        withCoords.sort((a, b) => {
          const aLat = (a as any).latitude
          const aLng = (a as any).longitude
          const bLat = (b as any).latitude
          const bLng = (b as any).longitude
          return haversineKm(userCoords, { lat: aLat, lng: aLng }) -
                 haversineKm(userCoords, { lat: bLat, lng: bLng })
        })
        return withCoords
      }
    }

    return arr
  }, [businesses, type, area, sort, openOnly, offersOnly, search, foodCat, nearMe, userCoords])

  const activeFiltersCount =
    (type !== 'all' ? 1 : 0) + (area !== 'all' ? 1 : 0) + (openOnly ? 1 : 0) +
    (offersOnly ? 1 : 0) + (search.trim() ? 1 : 0) + (foodCat ? 1 : 0) + (nearMe ? 1 : 0)

  function toggleNearMe() {
    if (nearMe) { setNearMe(false); return }
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setNearMe(true)
      },
      () => setNearMe(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    )
  }

  function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const x = Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180) * Math.cos(b.lat*Math.PI/180) * Math.sin(dLng/2)**2
    return 2 * R * Math.asin(Math.sqrt(x))
  }

  function clearAll() { router.replace(pathname, { scroll: false }); setNearMe(false) }
  const activeSort = SORTS.find((s) => s.key === sort) ?? SORTS[0]

  return (
    <section className="exc">
      <div className="exc-types">
        {TYPES.map((t) => {
          const count = t.key === 'all' ? businesses.length : businesses.filter((b) => getType(b) === t.key).length
          return (
            <button key={t.key} type="button" className={`exc-type ${type === t.key ? 'is-active' : ''}`}
              onClick={() => updateParams({ type: t.key === 'all' ? null : t.key })}>
              <span className="exc-type__label">{t.label}</span>
              <span className="exc-type__count">{count}</span>
            </button>
          )
        })}
      </div>

      
      <div className="exc-filters">
        <div className="exc-filters__left">
          {areas.length > 1 && (
            <select className="exc-select" value={area}
              onChange={(e) => updateParams({ area: e.target.value === 'all' ? null : e.target.value })}
              aria-label="المنطقة">
              <option value="all">كل المناطق</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          )}

          <button type="button" className={`exc-toggle ${openOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ open: openOnly ? null : '1' })}>مفتوح دلوقتي</button>

          <button type="button" className={`exc-toggle ${offersOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ offers: offersOnly ? null : '1' })}>فيه عروض</button>

          <button type="button" className={`exc-toggle ${nearMe ? 'is-active' : ''}`}
            onClick={toggleNearMe}>📍 قريب مني</button>

          <div className="exc-sort">
            <button type="button" className="exc-sort__trigger"
              onClick={() => setSortOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={sortOpen}>
              <span>{activeSort.label}</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {sortOpen && (
              <>
                <div className="exc-sort__backdrop" onClick={() => setSortOpen(false)} />
                <ul className="exc-sort__menu" role="listbox">
                  {SORTS.map((s) => (
                    <li key={s.key}>
                      <button type="button" className={`exc-sort__item ${sort === s.key ? 'is-active' : ''}`}
                        onClick={() => { updateParams({ sort: s.key === 'default' ? null : s.key }); setSortOpen(false) }}>
                        {s.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="exc-filters__right">
          {activeFiltersCount > 0 && (
            <button type="button" className="exc-clear" onClick={clearAll}>
              <IcClose /> امسح الفلاتر ({activeFiltersCount})
            </button>
          )}
          <div className="exc-view">
            <button type="button" className={`exc-view__btn ${view === 'grid' ? 'is-active' : ''}`}
              onClick={() => updateParams({ view: null })} aria-label="شبكة">▦</button>
            <button type="button" className={`exc-view__btn ${view === 'list' ? 'is-active' : ''}`}
              onClick={() => updateParams({ view: 'list' })} aria-label="قائمة"><IcMenu /></button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="exc-empty">
          <span className="exc-empty__emoji"><IcSearch /></span>
          <h3 className="exc-empty__title">مفيش نتائج</h3>
          <p className="exc-empty__msg">جرّب فلتر تاني أو امسح البحث</p>
          <button type="button" className="exc-empty__btn" onClick={clearAll}>امسح كل الفلاتر</button>
        </div>
      ) : (
        <>
          <p className="exc-count"><strong>{filtered.length}</strong> مكان</p>
          <div className={`exc-grid ${view === 'list' ? 'exc-grid--list' : ''}`}>
            {filtered.map((b) => <ExploreCard key={b.slug} business={b as any} />)}
          </div>
        </>
      )}
    </section>
  )
}
