'use client'

import { useGeo } from '@/lib/contexts/geo-context'
import { distanceKm, formatDistance } from '@/lib/utils/distance'

// ═══════════════════════════════════════════════════════════
// EAH — useDistance
// يحسب المسافة بين المستخدم ونقطة (نشاط/فرع)
// ═══════════════════════════════════════════════════════════

export type DistanceResult =
  | { status: 'unavailable' }
  | { status: 'loading' }
  | { status: 'available'; km: number; label: string; veryClose: boolean }

export function useDistance(lat: number | null, lng: number | null): DistanceResult {
  const geo = useGeo()

  if (geo.status !== 'granted') {
    return { status: geo.status === 'loading' ? 'loading' : 'unavailable' }
  }

  if (lat === null || lng === null) return { status: 'unavailable' }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { status: 'unavailable' }

  const km = distanceKm(geo.location, { lat, lng })
  const label = formatDistance(km)
  const veryClose = km < 0.1 // أقل من 100 متر

  return { status: 'available', km, label, veryClose }
}
