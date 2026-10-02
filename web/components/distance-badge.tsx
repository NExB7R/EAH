'use client'

import { MapPinIcon } from './icons'
import { useGeolocation } from '@/lib/hooks/use-geolocation'
import { distanceKm, formatDistance, isValidLatLng } from '@/lib/utils/distance'
import styles from './distance-badge.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Distance Badge
// يظهر المسافة بين المستخدم والنشاط (لو الاثنين متوفرين)
// ═══════════════════════════════════════════════════════════

type Props = {
  lat: number | null
  lng: number | null
  className?: string
}

export default function DistanceBadge({ lat, lng, className = '' }: Props) {
  const geo = useGeolocation()

  if (geo.status !== 'granted') return null
  if (lat === null || lng === null) return null
  if (!isValidLatLng({ lat, lng })) return null

  const target = { lat, lng }
  const km = distanceKm(geo.location, target)

  return (
    <span className={`${styles.badge} ${className}`} aria-label={`يبعد ${formatDistance(km)}`}>
      <MapPinIcon size={11} />
      <span>{formatDistance(km)}</span>
    </span>
  )
}
