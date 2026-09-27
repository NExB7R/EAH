'use client'

import { CrownGoldIcon } from './icons'
import styles from './signature.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Signature Badge (Gold plate + crown)
// ═══════════════════════════════════════════════════════════

export default function Signature() {
  return (
    <div className={styles.wrap}>
      <span className={styles.plate} aria-hidden>
        <span className={styles.glow} />
        <span className={styles.crown}>
          <CrownGoldIcon size={22} />
        </span>
      </span>

      <span className={styles.name}>NourEldin B7R</span>

      <span className={styles.role}>صاحب EAH</span>
    </div>
  )
}
