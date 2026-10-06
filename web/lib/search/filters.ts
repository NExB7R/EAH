// ═══════════════════════════════════════════════════════════
// EAH — Explore Filters
// فلترة + فرز في السيرفر — كل فلتر URL-driven
// ═══════════════════════════════════════════════════════════

import type { Business, BusinessType } from '@/lib/data/businesses'
import { isOpenNow } from '@/lib/data/businesses'
import { distanceKm, type LatLng } from '@/lib/utils/distance'

export type SortOption = 'trust' | 'rating' | 'distance' | 'newest' | 'relevance'

export type Filters = {
  types: BusinessType[]
  area: string | null
  openNow: boolean
  hasOffers: boolean
  minRating: number | null
  maxDistanceMeters: number | null
  userLocation: LatLng | null
  sort: SortOption
}

export const DEFAULT_FILTERS: Filters = {
  types: [],
  area: null,
  openNow: false,
  hasOffers: false,
  minRating: null,
  maxDistanceMeters: null,
  userLocation: null,
  sort: 'trust',
}

export function applyFilters(businesses: Business[], filters: Filters): Business[] {
  let result = businesses

  // 1) النوع
  if (filters.types.length > 0) {
    result = result.filter((b) => filters.types.includes(b.business_type))
  }

  // 2) المنطقة
  if (filters.area) {
    result = result.filter((b) => b.area === filters.area)
  }

  // 3) مفتوح دلوقتي
  if (filters.openNow) {
    result = result.filter((b) => isOpenNow(b.working_hours))
  }

  // 4) عنده عروض
  if (filters.hasOffers) {
    result = result.filter((b) => (b.offers_count ?? 0) > 0)
  }

  // 5) أقل تقييم
  if (filters.minRating !== null) {
    result = result.filter((b) => b.rating_avg >= filters.minRating!)
  }

  // 6) المسافة القصوى (متر)
  if (filters.maxDistanceMeters !== null && filters.userLocation) {
    const loc = filters.userLocation
    const max = filters.maxDistanceMeters
    result = result.filter((b) => {
      if (!b.location) return false
      const m = distanceKm(loc, b.location) * 1000
      return m <= max
    })
  }

  // ═══ الفرز ═══
  if (filters.sort === 'relevance') return result

  switch (filters.sort) {
    case 'distance': {
      if (!filters.userLocation) return result
      const loc = filters.userLocation
      result = [...result].sort((a, b) => {
        const da = a.location ? distanceKm(loc, a.location) : Infinity
        const db = b.location ? distanceKm(loc, b.location) : Infinity
        return da - db
      })
      break
    }
    case 'rating': {
      result = [...result].sort((a, b) => {
        // الأعلى تقييماً — مع مراعاة عدد المراجعات
        const scoreA = a.rating_avg * Math.min(1, a.rating_count / 5)
        const scoreB = b.rating_avg * Math.min(1, b.rating_count / 5)
        return scoreB - scoreA
      })
      break
    }
    case 'newest': {
      result = [...result].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      break
    }
    case 'trust':
    default: {
      result = [...result].sort((a, b) => b.trust_score - a.trust_score)
    }
  }

  return result
}

export function parseFilters(params: Record<string, string | undefined>): Filters {
  const types: BusinessType[] = []
  const validTypes: BusinessType[] = [
    'restaurant',
    'pharmacy',
    'supermarket',
    'delivery_office',
    'misc',
  ]
  if (params.type && validTypes.includes(params.type as BusinessType)) {
    types.push(params.type as BusinessType)
  }

  const lat = params.lat ? parseFloat(params.lat) : null
  const lng = params.lng ? parseFloat(params.lng) : null
  const userLocation: LatLng | null =
    lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null

  const minRating = params.rating ? parseFloat(params.rating) : null
  const maxDistanceMeters = params.distance ? parseInt(params.distance, 10) : null

  const sort = (params.sort as SortOption) || (userLocation ? 'distance' : 'trust')

  return {
    types,
    area: params.area ?? null,
    openNow: params.open === '1',
    hasOffers: params.offers === '1',
    minRating: minRating !== null && Number.isFinite(minRating) ? minRating : null,
    maxDistanceMeters:
      maxDistanceMeters !== null && Number.isFinite(maxDistanceMeters) && maxDistanceMeters > 0
        ? maxDistanceMeters
        : null,
    userLocation,
    sort,
  }
}
