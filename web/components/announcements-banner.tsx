'use client'

import { useCallback, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { CloseIcon, InfoIcon, ArrowLeftIcon } from './icons'
import type { Announcement } from '@/lib/data/announcements'
import styles from './announcements-banner.module.css'

// ═══════════════════════════════════════════════════════════
// EAH — Announcements Banner
//   • يظهر أعلى الموقع
//   • يقبل إغلاق (localStorage per announcement)
//   • 4 themes: gold / purple / orange / teal
// ═══════════════════════════════════════════════════════════

type Props = {
  announcements: Announcement[]
}

const DISMISS_KEY_PREFIX = 'eah-ann-dismiss:'
const listeners = new Set<() => void>()

function emitChange() {
  for (const l of listeners) l()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener('storage', cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', cb)
  }
}

function isDismissed(id: string): boolean {
  try {
    return !!localStorage.getItem(DISMISS_KEY_PREFIX + id)
  } catch {
    return false
  }
}

function getSnapshot(): string {
  // نحسب hash لكل الإعلانات المُغلقة
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(DISMISS_KEY_PREFIX)) keys.push(k)
    }
    return keys.sort().join('|')
  } catch {
    return ''
  }
}

export default function AnnouncementsBanner({ announcements }: Props) {
  // hydration-safe: server = '', client = localStorage snapshot
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => '')
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const dismiss = useCallback((id: string) => {
    try {
      localStorage.setItem(DISMISS_KEY_PREFIX + id, '1')
      emitChange()
    } catch {
      // ignore
    }
  }, [])

  if (!mounted) return null

  const visible = announcements.find((a) => !a.dismissible || !isDismissed(a.id)) ?? null

  if (!visible) return null

  const themeClass = styles[visible.theme] ?? styles.gold

  return (
    <div className={`${styles.banner} ${themeClass}`} role="banner" data-snapshot={snapshot}>
      <div className={styles.container}>
        <span className={styles.icon}>
          <InfoIcon size={18} />
        </span>

        <div className={styles.content}>
          <strong className={styles.title}>{visible.title}</strong>
          {visible.body && <span className={styles.body}>{visible.body}</span>}
        </div>

        {visible.link_url && visible.link_label && (
          <Link href={visible.link_url} className={styles.link}>
            <span>{visible.link_label}</span>
            <ArrowLeftIcon size={14} />
          </Link>
        )}

        {visible.dismissible && (
          <button
            type="button"
            onClick={() => dismiss(visible.id)}
            className={styles.close}
            aria-label="إغلاق الإعلان"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
