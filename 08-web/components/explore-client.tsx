'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import SimpleFlipCard from './simple-flip-card'
import FilterSelect from './ui/filter-select'
import './explore-client.css'
import { IcClose, IcMenu } from '@/components/eah-icons'
import { normalizeArabic } from '@/lib/search/normalize'
import { MISC_CATEGORIES } from '@/lib/misc-categories'

type BusinessType = 'restaurant' | 'pharmacy' | 'supermarket' | 'delivery_office' | 'misc'

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

const VALID_TYPES = ['restaurant', 'pharmacy', 'supermarket', 'delivery_office', 'misc']
const getType = (b: Business): string => (b.type ?? b.business_type ?? '') as string

export default function ExploreClient({
  businesses,
  initialType,
  clientCoords,
  availableFoodCats = [],
}: {
  businesses: Business[]
  initialType?: string
  clientCoords?: { lat: number; lng: number } | null
  availableFoodCats?: { key: string; label: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawType = searchParams.get('type') ?? initialType ?? 'all'
  const type = VALID_TYPES.includes(rawType) ? rawType : 'all'
  const area = searchParams.get('area') ?? ''
  const sort = searchParams.get('sort') ?? ''
  const search = searchParams.get('q') ?? ''
  const foodCat = searchParams.get('food') ?? ''
  const openOnly = searchParams.get('open') === '1'
  const offersOnly = searchParams.get('offers') === '1'
  const nearRequested = searchParams.get('near') === '1'
  const view = (searchParams.get('view') === 'list' ? 'list' : 'grid') as 'grid' | 'list'

  const [nearMe, setNearMe] = useState(nearRequested && Boolean(clientCoords))
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(clientCoords ?? null)
  const requestedLocationRef = useRef(false)

  useEffect(() => {
    if (!nearRequested || nearMe || requestedLocationRef.current) return
    if (clientCoords) {
      setUserCoords(clientCoords)
      setNearMe(true)
      return
    }
    if (!navigator.geolocation) return

    requestedLocationRef.current = true
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setNearMe(true)
      },
      () => setNearMe(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
  }, [clientCoords, nearMe, nearRequested])

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

  const typeCounts = useMemo(() => {
    const m: Record<string, number> = { all: businesses.length }
    for (const t of VALID_TYPES) m[t] = businesses.filter((b) => getType(b) === t).length
    return m
  }, [businesses])

  const foodCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const c of availableFoodCats) {
      m[c.key] = businesses.filter((b) => b.food_categories?.includes(c.key)).length
    }
    return m
  }, [businesses, availableFoodCats])

  const areaCounts = useMemo(() => {
    const m: Record<string, number> = {}
    for (const a of areas) m[a] = businesses.filter((b) => b.area === a).length
    return m
  }, [businesses, areas])

  // ─── Filter + sort ───
  const filtered = useMemo(() => {
    let list = businesses
    if (type !== 'all') list = list.filter((b) => getType(b) === type)
    if (foodCat) list = list.filter((b) => b.food_categories?.includes(foodCat))
    if (area) list = list.filter((b) => b.area === area)
    if (openOnly) list = list.filter((b) => b.open)
    if (offersOnly) list = list.filter((b) => (b.activeOffers ?? 0) > 0)

    if (search.trim()) {
      const query = normalizeArabic(search)
      list = list.filter((business) => {
        const searchable = normalizeArabic([
          business.name,
          business.area,
          business.reason,
          business.hook,
          ...(business.vibe ?? []),
        ].filter(Boolean).join(' '))
        return query.split(' ').every((word) => searchable.includes(word))
      })
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
      const withCoords = arr.filter((b) => b.latitude != null && b.longitude != null)
      if (withCoords.length > 0) {
        withCoords.sort((a, b) => {
          const aD = haversineKm(userCoords, { lat: a.latitude, lng: a.longitude })
          const bD = haversineKm(userCoords, { lat: b.latitude, lng: b.longitude })
          return aD - bD
        })
        return withCoords
      }
    }

    return arr
  }, [businesses, type, area, sort, openOnly, offersOnly, search, foodCat, nearMe, userCoords])

  const activeFiltersCount =
    (type !== 'all' ? 1 : 0) +
    (area ? 1 : 0) +
    (openOnly ? 1 : 0) +
    (offersOnly ? 1 : 0) +
    (search.trim() ? 1 : 0) +
    (foodCat ? 1 : 0) +
    (nearMe ? 1 : 0)

  function toggleNearMe() {
    if (nearMe) {
      setNearMe(false)
      updateParams({ near: null })
      return
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        setNearMe(true)
        updateParams({ near: '1' })
      },
      () => setNearMe(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
  }

  function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return 2 * R * Math.asin(Math.sqrt(x))
  }

  function clearAll() {
    router.replace(pathname, { scroll: false })
    setNearMe(false)
  }

  // ─── Options for filters ───
  const TYPE_OPTS = [
    { value: 'restaurant',      label: 'مطاعم', count: typeCounts.restaurant, disabled: typeCounts.restaurant === 0 },
    { value: 'pharmacy',        label: 'صيدليات', count: typeCounts.pharmacy, disabled: typeCounts.pharmacy === 0 },
    { value: 'supermarket',     label: 'ماركت', count: typeCounts.supermarket, disabled: typeCounts.supermarket === 0 },
    { value: 'delivery_office', label: 'توصيل', count: typeCounts.delivery_office, disabled: typeCounts.delivery_office === 0 },
    { value: 'misc',            label: 'أنشطة أخرى', count: typeCounts.misc, disabled: typeCounts.misc === 0 },
  ]

  const AREA_OPTS = areas.map((a) => ({ value: a, label: a, count: areaCounts[a] }))

  const FOOD_OPTS = availableFoodCats.map((category) => ({
    value: category.key,
    label: category.label,
    count: foodCounts[category.key] ?? 0,
    disabled: (foodCounts[category.key] ?? 0) === 0,
  }))

  const SORT_OPTS = [
    { value: 'rating', label: 'الأعلى تقييم' },
    { value: 'views',  label: 'الأكثر نشاط' },
    { value: 'offers', label: 'فيه عروض' },
    { value: 'new',    label: 'الأحدث' },
  ]

  return (
    <section className="exc">
      {/* ─── Filter Bar ─── */}
      <div className="exc-bar">
        <div className="exc-bar__scroll">
          <FilterSelect
            label="النوع"
            value={type === 'all' ? null : type}
            options={TYPE_OPTS}
            onChange={(v) => updateParams({ type: v })}
            placeholder="كل الأنواع"
          />

          {(type === 'all' || type === 'restaurant') && FOOD_OPTS.length > 0 && (
            <FilterSelect
              label="التصنيف"
              value={foodCat || null}
              options={FOOD_OPTS}
              onChange={(v) => updateParams({ food: v })}
              placeholder="كل الأكلات"
            />
          )}

          {areas.length > 1 && (
            <FilterSelect
              label="المنطقة"
              value={area || null}
              options={AREA_OPTS}
              onChange={(v) => updateParams({ area: v })}
              placeholder="كل المناطق"
            />
          )}

          <FilterSelect
            label="ترتيب"
            value={sort || null}
            options={SORT_OPTS}
            onChange={(v) => updateParams({ sort: v })}
            placeholder="الأنسب ليك"
            clearable
          />

          <button
            type="button"
            className={`exc-chip ${openOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ open: openOnly ? null : '1' })}
          >
            مفتوح دلوقتي
          </button>

          <button
            type="button"
            className={`exc-chip ${offersOnly ? 'is-active' : ''}`}
            onClick={() => updateParams({ offers: offersOnly ? null : '1' })}
          >
            فيه عروض
          </button>

          <button
            type="button"
            className={`exc-chip ${nearMe ? 'is-active' : ''}`}
            onClick={toggleNearMe}
          >
            قريب مني
          </button>
        </div>

        <div className="exc-bar__end">
          {activeFiltersCount > 0 && (
            <button type="button" className="exc-clear" onClick={clearAll}>
              <IcClose /> مسح ({activeFiltersCount})
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
              <IcMenu />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Results ─── */}
      {filtered.length === 0 ? (
        <div className="exc-empty">
          <h3 className="exc-empty__title">مفيش نتايج</h3>
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
            {filtered.map((business, index) => (
              <SimpleFlipCard key={business.slug} business={business as any} variant="grid" />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
