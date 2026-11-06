import EmptyState from '@/components/empty-state'
import { ClockIcon } from '@/components/icons'
import styles from './notifications.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Broadcast History List
// ═══════════════════════════════════════════════════════════

export type HistoryItem = {
  id: string
  created_at: string
  actor_name: string
  audience: string
  title: string
  inserted: number
  pushed: number
  total: number
}

const AUDIENCE_LABEL: Record<string, string> = {
  all: 'الكل',
  customers: 'العملاء',
  merchants: 'التجار',
  verified: 'الموثّقون',
  premium: 'مميز',
}

export default function HistoryList({ items }: { items: HistoryItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        Icon={ClockIcon}
        title="مفيش إشعارات مرسلة"
        description="أول إشعار هتبعته هيظهر هنا"
      />
    )
  }

  return (
    <div className={styles.historyList}>
      {items.map((it) => {
        const date = new Date(it.created_at).toLocaleString('ar-EG', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        return (
          <div key={it.id} className={styles.historyCard}>
            <div className={styles.historyHead}>
              <span className={styles.historyTitle}>{it.title}</span>
              <span className={styles.historyAudience}>
                {AUDIENCE_LABEL[it.audience] ?? it.audience}
              </span>
            </div>
            <div className={styles.historyMeta}>
              <span>{date}</span>
              <span>•</span>
              <span>بواسطة: {it.actor_name}</span>
            </div>
            <div className={styles.historyStats}>
              <span>مستهدفون: {it.total}</span>
              <span>أُرسل: {it.inserted}</span>
              <span>الإشعارات الفورية: {it.pushed}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
