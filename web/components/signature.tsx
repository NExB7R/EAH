'use client'

import styles from './signature.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Signature (French cursive style)
// ═══════════════════════════════════════════════════════════

export default function Signature() {
  return (
    <div className={styles.wrap}>
      <span className={styles.label}>صنع بحب بواسطة</span>
      <span className={styles.name}>NourEldin B7R</span>
    </div>
  )
}
