'use client'

import styles from './signature.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Signature (NourEldin B7R — script, gold, glows on hover)
// ═══════════════════════════════════════════════════════════

export default function Signature() {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>صنع بحب بواسطة</span>
      <span className={styles.name}>NourEldin B7R</span>
    </div>
  )
}
