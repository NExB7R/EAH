import { AlertIcon } from './icons'
import styles from './business-notice.module.css'
import type { BusinessNoticeData } from '@/lib/data/business-detail'

// ═══════════════════════════════════════════════════════════
// EAH — Business Notice Banner
// Rendered on business detail page when admin sets an active notice.
// Server component — no client interactivity needed.
// ═══════════════════════════════════════════════════════════

export default function BusinessNotice({ notice }: { notice: BusinessNoticeData }) {
  return (
    <div className={`${styles.notice} ${styles[notice.severity]}`} role="alert">
      <span className={styles.icon} aria-hidden>
        <AlertIcon size={16} />
      </span>
      <span className={styles.text}>{notice.text}</span>
    </div>
  )
}
