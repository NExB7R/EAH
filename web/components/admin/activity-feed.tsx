'use client'

import { useEffect, useState } from 'react'
import { ClockIcon, AlertIcon } from '@/components/icons'
import styles from './activity-feed.module.css'

type FeedItem = {
  id: string
  label: string
  actor: string
  created_at: string
}

function timeAgo(iso: string): string {
  const timestamp = new Date(iso).getTime()
  if (!Number.isFinite(timestamp)) return 'وقت غير معروف'

  const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000))
  if (minutes < 1) return 'دلوقتي'
  if (minutes < 60) return `من ${minutes} د`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `من ${hours} س`
  return `من ${Math.floor(hours / 24)} ي`
}

function isFeedItem(value: unknown): value is FeedItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.label === 'string' &&
    typeof item.actor === 'string' &&
    typeof item.created_at === 'string'
  )
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export default function ActivityFeed() {
  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let disposed = false
    let timer: number | undefined
    let controller: AbortController | undefined

    const clearTimer = () => {
      if (timer !== undefined) {
        window.clearTimeout(timer)
        timer = undefined
      }
    }

    const load = async () => {
      if (disposed || document.hidden) return

      const requestController = new AbortController()
      controller = requestController

      try {
        const response = await fetch('/api/admin/live-feed', {
          cache: 'no-store',
          signal: requestController.signal,
        })
        if (!response.ok) throw new Error('Feed request failed')

        const payload: unknown = await response.json()
        if (
          typeof payload !== 'object' ||
          payload === null ||
          !('items' in payload) ||
          !Array.isArray(payload.items) ||
          !payload.items.every(isFeedItem)
        ) {
          throw new Error('Invalid feed response')
        }

        if (!disposed) {
          setItems(payload.items)
          setError(false)
        }
      } catch (requestError) {
        if (!disposed && !isAbortError(requestError)) setError(true)
      } finally {
        const ownsRequest = controller === requestController
        if (ownsRequest) controller = undefined
        if (ownsRequest && !disposed && !document.hidden) {
          timer = window.setTimeout(() => {
            void load()
          }, 15000)
        }
        if (ownsRequest && !disposed) setLoading(false)
      }
    }

    const handleVisibilityChange = () => {
      clearTimer()
      controller?.abort()
      if (!document.hidden) void load()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    void load()

    return () => {
      disposed = true
      clearTimer()
      controller?.abort()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className={styles.wrap}>
        <div className={styles.header}>
          <ClockIcon size={16} />
          <h3 className={styles.title}>النشاط الحي</h3>
        </div>
        <div className={styles.skeleton} aria-hidden="true">
          {[1, 2, 3].map((item) => (
            <div key={item} className={styles.skeletonItem} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <section className={styles.wrap} aria-labelledby="admin-activity-title">
        <div className={styles.header}>
          <AlertIcon size={16} />
          <h3 className={styles.title} id="admin-activity-title">
            النشاط الحي
          </h3>
        </div>
        <div className={styles.empty} role="status">
          تعذّر تحميل النشاط — جرّب تحديث الصفحة
        </div>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className={styles.wrap} aria-labelledby="admin-activity-title">
        <div className={styles.header}>
          <ClockIcon size={16} />
          <h3 className={styles.title} id="admin-activity-title">
            النشاط الحي
          </h3>
        </div>
        <div className={styles.empty}>لا توجد أحداث بعد — ستظهر هنا الإجراءات الإدارية</div>
      </section>
    )
  }

  return (
    <section className={styles.wrap} aria-labelledby="admin-activity-title">
      <div className={styles.header}>
        <span className={styles.pulse} aria-hidden="true" />
        <h3 className={styles.title} id="admin-activity-title">
          النشاط الحي
        </h3>
        <span className={styles.live}>مباشر</span>
      </div>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <span className={styles.dot} aria-hidden="true" />
            <div className={styles.itemBody}>
              <span className={styles.itemLabel}>{item.label}</span>
              <span className={styles.itemMeta}>
                {item.actor} · {timeAgo(item.created_at)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
