// ═══════════════════════════════════════════════════════════
// EAH — Distance Utility
// Haversine formula — دقيق حتى 1000كم
// ═══════════════════════════════════════════════════════════

const EARTH_RADIUS_KM = 6371

export type LatLng = { lat: number; lng: number }

export function isValidLatLng(value: LatLng | null | undefined): value is LatLng {
  return !!value && Number.isFinite(value.lat) && Number.isFinite(value.lng) &&
    value.lat >= -90 && value.lat <= 90 && value.lng >= -180 && value.lng <= 180
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// المسافة بالكيلومتر
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)

  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

// تنسيق عربي بدقة 10 متر
export function formatDistance(km: number): string {
  const m = Math.round(km * 1000)

  // أقل من 20م = إنت هنا
  if (m < 20) return 'إنت هنا'

  // 20-100م: دقة 5م
  if (m < 100) {
    const r = Math.round(m / 5) * 5
    return `${r} م`
  }

  // 100م-1كم: دقة 10م
  if (m < 1000) {
    const r = Math.round(m / 10) * 10
    return `${r} م`
  }

  // 1-10كم: دقة 10م (2 decimals)
  if (km < 10) return `${km.toFixed(2)} كم`

  // أكبر: دقة 100م (1 decimal)
  return `${km.toFixed(1)} كم`
}

// المسافة بالمتر (للمقارنة الدقيقة)
export function distanceMeters(a: LatLng, b: LatLng): number {
  return distanceKm(a, b) * 1000
}
