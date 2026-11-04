// EAH — Discovery filters. Public filters must never depend on gamification points.
import type { Business, BusinessType } from '@/lib/data/businesses'
import { isBusinessOpen } from '@/lib/utils/working-hours'
import { getBusinessReputationScore } from '@/lib/reputation'
import { distanceKm, type LatLng } from '@/lib/utils/distance'

export type SortOption = 'quality' | 'trust' | 'rating' | 'distance' | 'newest' | 'relevance'

const VALID_SORT_OPTIONS: ReadonlySet<string> = new Set([
  'quality',
  'trust',
  'rating',
  'distance',
  'newest',
  'relevance',
])

/**
 * Text searches default to relevance, but an explicit user-selected sort wins.
 * Distance sorting is valid only when a usable location is available.
 */
export function resolveResultSort(
  hasQuery: boolean,
  requestedSort: string | undefined,
  filters: Filters,
): SortOption {
  if (!hasQuery) {
    if (filters.sort === 'relevance') return filters.userLocation ? 'distance' : 'quality'
    if (filters.sort === 'distance' && !filters.userLocation) return 'quality'
    return filters.sort
  }

  const canApplyRequestedSort =
    VALID_SORT_OPTIONS.has(requestedSort ?? '') &&
    !(requestedSort === 'distance' && !filters.userLocation)

  return canApplyRequestedSort ? filters.sort : 'relevance'
}
export type Filters = {
  types: BusinessType[]
  verifiedOnly: boolean
  area: string | null
  openNow: boolean
  online: boolean
  hasOffers: boolean
  isNew: boolean
  minRating: number | null
  maxDistanceMeters: number | null
  userLocation: LatLng | null
  sort: SortOption
}

export const DEFAULT_FILTERS: Filters = {
  types: [],
  verifiedOnly: false,
  area: null,
  openNow: false,
  online: false,
  hasOffers: false,
  isNew: false,
  minRating: null,
  maxDistanceMeters: null,
  userLocation: null,
  sort: 'quality',
}

export function applyFilters(businesses: Business[], filters: Filters): Business[] {
  let result = businesses
  if (filters.types.length > 0) result = result.filter((b) => filters.types.includes(b.business_type))
  if (filters.verifiedOnly) result = result.filter((b) => b.is_verified === true)
  if (filters.area) result = result.filter((b) => b.area === filters.area)
  if (filters.openNow) result = result.filter((business) => isBusinessOpen(business))
  if (filters.online) result = result.filter((b) => b.accepts_orders === true)
  if (filters.hasOffers) result = result.filter((b) => (b.offers_count ?? 0) > 0)
  if (filters.isNew) result = result.filter((b) => b.is_new_project === true)
  if (filters.minRating !== null) result = result.filter((b) => b.rating_count > 0 && b.rating_avg >= filters.minRating!)
  if (filters.maxDistanceMeters !== null && filters.userLocation) {
    const loc = filters.userLocation
    const max = filters.maxDistanceMeters
    result = result.filter((b) => b.location && distanceKm(loc, b.location) * 1000 <= max)
  }

  if (filters.sort === 'relevance') return result
  switch (filters.sort) {
    case 'distance': {
      if (!filters.userLocation) return result
      const loc = filters.userLocation
      return [...result].sort((a, b) => {
        const da = a.location ? distanceKm(loc, a.location) : Infinity
        const db = b.location ? distanceKm(loc, b.location) : Infinity
        if (Math.abs(da - db) > 0.0005) return da - db
        return getBusinessReputationScore(b) - getBusinessReputationScore(a)
      })
    }
    case 'rating':
      return [...result].sort((a, b) => {
        const aCount = Math.max(0, a.rating_count)
        const bCount = Math.max(0, b.rating_count)
        const aScore = aCount > 0 ? (a.rating_avg * aCount + 12) / (aCount + 3) : 0
        const bScore = bCount > 0 ? (b.rating_avg * bCount + 12) / (bCount + 3) : 0
        return bScore - aScore || bCount - aCount
      })
    case 'newest':
      return [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'trust':
    case 'quality':
    default:
      return [...result].sort((a, b) => getBusinessReputationScore(b) - getBusinessReputationScore(a))
  }
}

export function parseFilters(params: Record<string, string | undefined>): Filters {
  const types: BusinessType[] = []
  const validTypes: BusinessType[] = ['restaurant', 'pharmacy', 'delivery_office', 'misc']
  if (params.type && validTypes.includes(params.type as BusinessType)) types.push(params.type as BusinessType)

  const lat = params.lat ? Number.parseFloat(params.lat) : null
  const lng = params.lng ? Number.parseFloat(params.lng) : null
  const userLocation: LatLng | null =
    lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)
      ? { lat, lng }
      : null
  const minRating = params.rating ? Number.parseFloat(params.rating) : null
  const maxDistanceMeters = params.distance ? Number.parseInt(params.distance, 10) : null
  const requestedSort = params.sort
  const hasUsableRequestedSort =
    VALID_SORT_OPTIONS.has(requestedSort ?? '') &&
    !(requestedSort === 'distance' && !userLocation)
  const sort: SortOption = hasUsableRequestedSort
    ? (requestedSort as SortOption)
    : userLocation
      ? 'distance'
      : 'quality'

  return {
    types,
    verifiedOnly: params.verified === '1',
    area: params.area ?? null,
    openNow: params.open === '1',
    online: params.online === '1',
    hasOffers: params.offers === '1',
    isNew: params.new === '1',
    minRating: minRating !== null && Number.isFinite(minRating) ? minRating : null,
    maxDistanceMeters: maxDistanceMeters !== null && Number.isFinite(maxDistanceMeters) && maxDistanceMeters > 0 ? maxDistanceMeters : null,
    userLocation,
    sort,
  }
}
