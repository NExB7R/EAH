/**
 * EAH Sync Manager — beteween offline queue + online
 */

export type SyncEvent = { count: number; ts: number }

export function getPendingCount(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem('eah-offline-queue') ?? '[]'
    const q = JSON.parse(raw)
    return Array.isArray(q) ? q.length : 0
  } catch {
    return 0
  }
}

export function onQueueChange(cb: (e: SyncEvent) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const detail = (e as CustomEvent).detail
    cb({ count: detail?.count ?? 0, ts: Date.now() })
  }
  window.addEventListener('eah-queue-updated', handler)
  return () => window.removeEventListener('eah-queue-updated', handler)
}

export async function flushQueue(): Promise<number> {
  if (typeof window === 'undefined') return 0
  try {
    const { flush } = await import('./offline-queue')
    if (typeof flush === 'function') {
      await flush()
    }
    return 0
  } catch {
    return 0
  }
}
