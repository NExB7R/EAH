'use client'

import { MapPinIcon } from './icons'
import { useDistance } from '@/lib/hooks/use-distance'
import type { LatLng } from '@/lib/utils/distance'
import styles from './distance-badge.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Distance Badge (v3)
//   • Available → shows distance
//   • Unavailable → returns null (caller shows area separately)
// ═══════════════════════════════════════════════════════════

type Props = {
  lat: number | null
  lng: number | null
  className?: string
  showHere?: boolean
  userLocation?: LatLng | null
  enabled?: boolean
}

export default function DistanceBadge({ lat, lng, className = '', showHere = true, userLocation, enabled = true }: Props) {
  const d = useDistance(lat, lng, userLocation)

  if (!enabled || d.status !== 'available') return null

  return (
    <span
      className={`${styles.badge} ${d.veryClose && showHere ? styles.here : ''} ${className}`}
      aria-label={`يبعد ${d.label}`}
    >
      <MapPinIcon size={10} />
      <span>{d.veryClose && showHere ? 'إنت هنا' : d.label}</span>
    </span>
  )
}
