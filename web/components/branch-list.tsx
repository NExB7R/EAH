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
  const showAddress = branch.address_text && branch.address_text !== branch.area
  const showArea = branch.area && (!branch.address_text || branch.address_text !== branch.area)

  return (
    <li
      className={[
        styles.item,
        branch.is_primary ? styles.primary : '',
        closest && !branch.is_primary ? styles.closest : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.iconWrap}>
        <StoreIcon size={branch.is_primary ? 16 : 14} />
      </div>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>
            <span className={styles.nameText}>{branch.name}</span>
            {branch.is_primary && <span className={styles.primaryBadge}>رئيسي</span>}
            {closest && (
              <span className={styles.closestBadge}>
                <CheckCircleIcon size={10} />
                الأقرب
              </span>
            )}
          </span>
          {d.status === 'available' && (
            <span className={styles.distance}>
              <MapPinIcon size={11} />
              {d.label}
            </span>
          )}
        </div>
        {(showAddress || showArea) && (
          <div className={styles.meta}>
            {showAddress && <span className={styles.addr}>{branch.address_text}</span>}
            {showArea && <span className={styles.area}>{branch.area}</span>}
          </div>
        )}
      </div>
    </li>
  )
}

export default function BranchList({ branches }: Props) {
  const geo = useGeo()

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
