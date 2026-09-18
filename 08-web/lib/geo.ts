export type Coords = { lat: number; lng: number }

export const SHIBIN_CENTER: Coords = { lat: 30.3130, lng: 31.2497 }

export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} متر`
  if (km < 10) return `${km.toFixed(1)} كم`
  return `${Math.round(km)} كم`
}

export function isValidCoords(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
