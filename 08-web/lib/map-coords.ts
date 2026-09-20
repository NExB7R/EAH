import 'server-only'

export const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'شبين القناطر': { lat: 30.3144, lng: 31.3212 },
  'القلج': { lat: 30.3225, lng: 31.3603 },
  'أبو زعبل': { lat: 30.2933, lng: 31.3700 },
  'الجبل الأصفر': { lat: 30.2850, lng: 31.3450 },
  'كفر بطا': { lat: 30.3350, lng: 31.2850 },
  'نوى': { lat: 30.3600, lng: 31.2900 },
  'طحا': { lat: 30.3450, lng: 31.3050 },
  'منشأة الكرام': { lat: 30.3300, lng: 31.3250 },
}

export function resolveCoords(
  lat: number | null | undefined,
  lng: number | null | undefined,
  area: string | undefined,
): { lat: number; lng: number; exact: boolean } | null {
  if (lat != null && lng != null) return { lat, lng, exact: true }
  if (area && AREA_COORDS[area]) return { ...AREA_COORDS[area], exact: false }
  return null
}
