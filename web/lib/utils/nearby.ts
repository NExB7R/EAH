import type { Business } from '@/lib/data/businesses'
import { distanceKm, type LatLng } from './distance'

const DEFAULT_NEARBY_AREA = 'شبين القناطر'
const DEFAULT_RADIUS_KM = 5

/**
 * Use real coordinates when the visitor has granted location access.
 * Otherwise, preserve the established Shibin El-Qanater discovery fallback.
 */
export function filterAndRankNearbyBusinesses(
  businesses: Business[],
  userLocation: LatLng | null,
  radiusKm = DEFAULT_RADIUS_KM,
): Business[] {
  if (
    !userLocation ||
    !Number.isFinite(userLocation.lat) ||
    !Number.isFinite(userLocation.lng) ||
    userLocation.lat < -90 ||
    userLocation.lat > 90 ||
    userLocation.lng < -180 ||
    userLocation.lng > 180
  ) {
    return businesses.filter((business) => business.area === DEFAULT_NEARBY_AREA)
  }

  const safeRadius = Number.isFinite(radiusKm) && radiusKm >= 0 ? radiusKm : DEFAULT_RADIUS_KM

  return businesses
    .map((business) => ({
      business,
      distance: business.location ? distanceKm(userLocation, business.location) : null,
    }))
    .filter(
      (entry): entry is { business: Business; distance: number } =>
        entry.distance !== null && Number.isFinite(entry.distance) && entry.distance <= safeRadius,
    )
    .sort(
      (a, b) =>
        a.distance - b.distance ||
        b.business.rating_avg - a.business.rating_avg ||
        b.business.rating_count - a.business.rating_count,
    )
    .map((entry) => entry.business)
}
