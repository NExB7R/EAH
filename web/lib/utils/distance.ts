// ═══════════════════════════════════════════════════════════
// EAH — Distance Utility
// Haversine formula — دقيق حتى 1000كم
// ═══════════════════════════════════════════════════════════

const EARTH_RADIUS_KM = 6371

export type LatLng = { lat: number; lng: number }

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

// تنسيق عربي بسيط
export function formatDistance(km: number): string {
  if (km < 0.05) return 'هنا'
  if (km < 1) {
    const m = Math.round(km * 1000)
    // قرّب لأقرب 50م
    const rounded = Math.round(m / 50) * 50
    return `${rounded} م`
  }
  if (km < 10) return `${km.toFixed(1)} كم`
  return `${Math.round(km)} كم`
}

// يتحقق إن الإحداثيات صحيحة
export function isValidLatLng(v: { lat: number | null; lng: number | null }): v is LatLng {
  return (
    typeof v.lat === 'number' &&
    typeof v.lng === 'number' &&
    Number.isFinite(v.lat) &&
    Number.isFinite(v.lng) &&
    v.lat >= -90 &&
    v.lat <= 90 &&
    v.lng >= -180 &&
    v.lng <= 180
  )
}
