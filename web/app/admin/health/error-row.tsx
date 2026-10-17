'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircleIcon, AlertIcon, CloseIcon } from '@/components/icons'
import { resolveError, unresolveError } from './actions'
import type { SystemError } from '@/lib/data/health'
import styles from './health.module.css'

const SEVERITY_LABEL: Record<string, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
}

function sevClass(sev: string) {
  const map: Record<string, string | undefined> = {
    low: styles.sev_low,
    medium: styles.sev_medium,
    high: styles.sev_high,
    critical: styles.sev_critical,
  }
  return map[sev] ?? ''
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'دلوقتي'
  if (m < 60) return `من ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `من ${h} ساعة`
  return `من ${Math.floor(h / 24)} يوم`
}

export default function ErrorRow({ error: e }: { error: SystemError }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [resolvedOptimistic, setResolvedOptimistic] = useState(!!e.resolved_at)
  const resolved = resolvedOptimistic

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, optimisticFlip: boolean) => {
    setErr(null)
    setResolvedOptimistic(optimisticFlip)
    startTransition(async () => {
      const res = await fn()
      if (res.ok) {
        if (optimisticFlip) setHidden(true)
        router.refresh()
      } else {
        setResolvedOptimistic(!optimisticFlip)
        setErr(res.error ?? 'فشل')
      }
    })
  }

  const handleToggle = () => {
    run(() => (resolved ? unresolveError(e.id) : resolveError(e.id)), !resolved)
  }

  if (hidden) return null

  return (
    <li
      className={`${styles.errorItem} ${sevClass(e.severity)} ${resolved ? styles.errorResolved : ''}`}
    >
      <div className={styles.errorHead}>
        <span className={`${styles.severity} ${sevClass(e.severity)}`}>
          {SEVERITY_LABEL[e.severity] ?? e.severity}
        </span>
        <span className={styles.source}>{e.source}</span>
        {e.path && <code className={styles.errorPath}>{e.path}</code>}
        <span className={styles.time}>{timeAgo(e.created_at)}</span>
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`${styles.resolveBtn} ${resolved ? styles.unresolve : ''}`}
          title={resolved ? 'إعادة فتح' : 'تم الحل'}
        >
          {resolved ? <CloseIcon size={12} /> : <CheckCircleIcon size={12} />}
          <span>{resolved ? 'إعادة فتح' : 'تم الحل'}</span>
        </button>
      </div>
      <div className={styles.errorMsg}>{e.message}</div>
      {err && (
        <div className={styles.rowError}>
          <AlertIcon size={12} /> {err}
        </div>
      )}
      {(Object.keys(e.metadata ?? {}).length > 0 || e.user_id) && (
        <>
          <button type="button" onClick={() => setExpanded((v) => !v)} className={styles.expandBtn}>
            {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>
          {expanded && (
            <pre className={styles.metadata}>
              {JSON.stringify({ user_id: e.user_id, metadata: e.metadata }, null, 2)}
            </pre>
          )}
        </>
      )}
    </li>
  )
}
