'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import EmptyState from '@/components/empty-state'
import { BellIcon, CheckCircleIcon, AlertIcon } from '@/components/icons'
import type { NotificationItem } from '@/lib/data/account'
import { markOwnNotificationRead } from './actions'
import styles from './notifications.module.css'

function formatDate(value: string): string {
  return new Date(value).toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function safeInternalLink(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null
  return value
}

export default function InboxList({ initialItems }: { initialItems: NotificationItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const markRead = (id: string) => {
    setError(null)
    setPendingId(id)
    startTransition(async () => {
      try {
        const result = await markOwnNotificationRead(id)
        if (!result.ok) {
          setError(result.error)
          return
        }

        setItems((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item,
          ),
        )
        router.refresh()
      } catch {
        setError('تعذر تحديث الإشعار — حاول تاني')
      } finally {
        setPendingId(null)
      }
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        Icon={BellIcon}
        title="مفيش إشعارات واردة"
        description="أي رسالة أو تنبيه يوصلك على حسابك هيظهر هنا."
      />
    )
  }

  return (
    <div>
      {error && (
        <div className={styles.resultErr} role="alert">
          <AlertIcon size={14} />
          <span>{error}</span>
        </div>
      )}

      <ul className={styles.inboxList}>
        {items.map((item) => {
          const unread = !item.read_at
          const href = safeInternalLink(item.deep_link)
          const date = formatDate(item.created_at)

          return (
            <li key={item.id} className={styles.inboxItem}>
              <article className={`${styles.inboxCard} ${unread ? styles.inboxUnread : ''}`}>
                <div className={styles.inboxIndicator} aria-hidden="true">
                  {unread ? <span className={styles.inboxDot} /> : <CheckCircleIcon size={17} />}
                </div>
                <div className={styles.inboxBody}>
                  <h3 className={styles.inboxTitle}>{item.title}</h3>
                  {item.body && <p className={styles.inboxText}>{item.body}</p>}
                  <time className={styles.inboxDate} dateTime={item.created_at}>
                    {date}
                  </time>
                  {href && (
                    <Link href={href} className={styles.inboxLink}>
                      فتح التفاصيل
                    </Link>
                  )}
                </div>
                {unread && (
                  <button
                    type="button"
                    className={styles.inboxReadButton}
                    onClick={() => markRead(item.id)}
                    disabled={pending || pendingId === item.id}
                  >
                    <CheckCircleIcon size={14} />
                    <span>{pendingId === item.id ? 'بيتم الحفظ...' : 'تمت القراءة'}</span>
                  </button>
                )}
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
