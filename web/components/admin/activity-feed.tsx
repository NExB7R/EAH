'use client'

import { useEffect, useState } from 'react'
import { ClockIcon, AlertIcon } from '@/components/icons'
import styles from './activity-feed.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Live Activity Feed
// يعرض آخر 20 حدث، ويحدّث كل 15 ثانية
// ═══════════════════════════════════════════════════════════

type FeedItem = {
  id: string
  label: string
  actor: string
  created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'دلوقتي'
  if (m < 60) return `من ${m} د`
  const h = Math.floor(m / 60)
  if (h < 24) return `من ${h} س`
  return `من ${Math.floor(h / 24)} ي`
}

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchFeed = async () => {
      try {
        const res = await fetch('/api/admin/live-feed', { cache: 'no-store' })
        if (!res.ok) throw new Error('failed')
        const data = (await res.json()) as { items: FeedItem[] }
        if (!cancelled) {
          setItems(data.items)
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchFeed()
    const t = setInterval(fetchFeed, 15000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <ClockIcon size={16} />
          <h3 className={styles.title}>النشاط الحي</h3>
        </div>
        <div className={styles.skeleton}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonItem} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <AlertIcon size={16} />
          <h3 className={styles.title}>النشاط الحي</h3>
        </div>
        <div className={styles.empty}>تعذّر تحميل النشاط</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <ClockIcon size={16} />
          <h3 className={styles.title}>النشاط الحي</h3>
        </div>
        <div className={styles.empty}>مفيش نشاط لسه</div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.pulse} />
        <h3 className={styles.title}>النشاط الحي</h3>
        <span className={styles.live}>مباشر</span>
      </div>
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.id} className={styles.item}>
            <span className={styles.dot} />
            <div className={styles.itemBody}>
              <span className={styles.itemLabel}>{it.label}</span>
              <span className={styles.itemMeta}>
                {it.actor} · {timeAgo(it.created_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
