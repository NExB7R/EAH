'use client'

import { StoreIcon, MapPinIcon, CheckCircleIcon } from './icons'
import { useDistance } from '@/lib/hooks/use-distance'
import { useGeo } from '@/lib/contexts/geo-context'
import { distanceKm } from '@/lib/utils/distance'
import type { Branch } from '@/lib/data/business-detail'
import styles from './branch-list.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Branch List (with distances + "الأقرب" badge)
// يحدد الفرع الأقرب تلقائياً لو المستخدم فعّل الموقع
// ═══════════════════════════════════════════════════════════

type Props = {
  branches: Branch[]
  onSelect?: (branch: Branch) => void
}

function BranchRow({ branch, closest }: { branch: Branch; closest: boolean }) {
  const d = useDistance(branch.latitude, branch.longitude)

  return (
    <li className={`${styles.item} ${closest ? styles.closest : ''}`}>
      <div className={styles.iconWrap}>
        <StoreIcon size={14} />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>
            {branch.name}
            {branch.is_primary && <span className={styles.primaryBadge}>رئيسي</span>}
            {closest && (
              <span className={styles.closestBadge}>
                <CheckCircleIcon size={10} />
                الأقرب ليك
              </span>
            )}
          </span>
          {d.status === 'available' && (
            <span className={styles.distance}>
              <MapPinIcon size={10} />
              {d.label}
            </span>
          )}
        </div>
        {branch.address_text && <span className={styles.addr}>{branch.address_text}</span>}
        {branch.area && <span className={styles.area}>{branch.area}</span>}
      </div>
    </li>
  )
}

export default function BranchList({ branches }: Props) {
  const geo = useGeo()

  // حدد الفرع الأقرب (لو المستخدم فعّل الموقع)
  let closestId: string | null = null
  if (geo.status === 'granted') {
    let minKm = Infinity
    for (const b of branches) {
      if (b.latitude === null || b.longitude === null) continue
      const km = distanceKm(geo.location, {
        lat: b.latitude,
        lng: b.longitude,
      })
      if (km < minKm) {
        minKm = km
        closestId = b.id
      }
    }
  }

  return (
    <ul className={styles.list}>
      {branches.map((b) => (
        <BranchRow key={b.id} branch={b} closest={b.id === closestId} />
      ))}
    </ul>
  )
}
