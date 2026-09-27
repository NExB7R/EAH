import styles from './signature.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Signature (HTML text, Great Vibes cursive)
// ═══════════════════════════════════════════════════════════

export default function Signature() {
  return (
    <div className={styles.wrap}>
      <span className={styles.name}>NourEldin B7R</span>
      <span className={styles.line} aria-hidden />
    </div>
  )
}
