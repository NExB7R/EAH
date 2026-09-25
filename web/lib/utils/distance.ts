// ═══════════════════════════════════════════════════════════
// EAH — Distance Utils (Haversine)
// ═══════════════════════════════════════════════════════════

const R = 6371 // نصف قطر الأرض بالكم

// المسافة بين نقطتين بالكم
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// تنسيق المسافة
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} م`
  if (km < 10) return `${km.toFixed(1)} كم`
  return `${Math.round(km)} كم`
}
