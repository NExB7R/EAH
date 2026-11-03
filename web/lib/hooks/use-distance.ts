'use client'

import { useGeo } from '@/lib/contexts/geo-context'
import { distanceKm, formatDistance, isValidLatLng, type LatLng } from '@/lib/utils/distance'

// ═══════════════════════════════════════════════════════════
// EAH — useDistance
// يحسب المسافة بين المستخدم ونقطة (نشاط/فرع)
// ═══════════════════════════════════════════════════════════

export type DistanceResult =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'available'; km: number; label: string; veryClose: boolean }

export function useDistance(lat: number | null, lng: number | null, locationOverride?: LatLng | null): DistanceResult {
  const geo = useGeo()
  const location = locationOverride !== undefined
    ? locationOverride
    : geo.status === 'granted'
      ? geo.location
      : null

  if (!location) {
    return { status: geo.status === 'loading' ? 'loading' : 'unavailable' }
  }

  if (lat === null || lng === null || !isValidLatLng({ lat, lng }) || !isValidLatLng(location)) {
    return { status: 'unavailable' }
  }

  const km = distanceKm(location, { lat, lng })
  const label = formatDistance(km)
  const veryClose = km < 0.1 // أقل من 100 متر

  return { status: 'available', km, label, veryClose }
}
