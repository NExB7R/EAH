import { idbGetAll, idbSet, idbDelete, STORES } from './db'

// ═══════════════════════════════════════════════════════════
// EAH — Pending Actions Queue (Offline → Sync)
// ═══════════════════════════════════════════════════════════

export type PendingType = 'review' | 'comment' | 'favorite' | 'follow' | 'like' | 'report'

export type PendingAction = {
  id?: number
  type: PendingType
  payload: Record<string, unknown>
  createdAt: number
  attempts: number
}

export async function enqueue(
  action: Omit<PendingAction, 'id' | 'createdAt' | 'attempts'>,
): Promise<void> {
  await idbSet(STORES.pending, {
    ...action,
    createdAt: Date.now(),
    attempts: 0,
  })
  await registerBackgroundSync()
}

export async function getPending(): Promise<PendingAction[]> {
  return idbGetAll<PendingAction>(STORES.pending)
}

export async function clearPending(): Promise<void> {
  const all = await getPending()
  for (const a of all) {
    if (a.id) await idbDelete(STORES.pending, a.id)
  }
}

// ─── Flush — يبعت كل العمليات المعلقة ───
export async function flushQueue(): Promise<{ flushed: number; failed: number; discarded: number }> {
  if (typeof navigator === 'undefined' || !navigator.onLine) {
    return { flushed: 0, failed: 0, discarded: 0 }
  }

  const queue = await getPending()
  if (queue.length === 0) return { flushed: 0, failed: 0, discarded: 0 }

  let flushed = 0
  let failed = 0
  let discarded = 0

  for (const action of queue) {
    try {
      const res = await fetch('/api/offline/flush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action.type, payload: action.payload }),
      })

      if (res.ok) {
        if (action.id) await idbDelete(STORES.pending, action.id)
        flushed++
      } else {
        // This is a permanent validation failure, not a network issue. Do not keep
        // retrying a review that cannot be attached to a completed platform order.
        if (res.status === 409) {
          const payload = (await res.json().catch(() => null)) as
            | { code?: string; discard?: boolean }
            | null
          if (payload?.code === 'review_requires_delivered_order' && payload.discard === true) {
            if (action.id) await idbDelete(STORES.pending, action.id)
            discarded++
            failed++
            continue
          }
        }

        // حاول تاني — بس زوّد الـ attempts
        const next: PendingAction = { ...action, attempts: action.attempts + 1 }
        // لو تجاوز 5 محاولات — ارفضه
        if (next.attempts >= 5) {
          if (action.id) await idbDelete(STORES.pending, action.id)
        } else {
          await idbSet(STORES.pending, next)
        }
        failed++
      }
    } catch {
      failed++
    }
  }

  return { flushed, failed, discarded }
}

// ─── Background Sync Registration ───
export async function registerBackgroundSync(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  try {
    const reg = await navigator.serviceWorker.ready
    const sync = (
      reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }
    ).sync
    if (sync) {
      await sync.register('eah-queue')
    }
  } catch {
    /* ignore — browser لا يدعم */
  }
}
