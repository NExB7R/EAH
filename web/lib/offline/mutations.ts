'use client'

import { enqueue, type PendingType } from './queue'

// ═══════════════════════════════════════════════════════════
// EAH — Offline-aware Mutations
// لو النت قطع → يحفظ في Queue → يتبعت لما يرجع
// ═══════════════════════════════════════════════════════════

export type OfflineResult = { ok: true; queued: boolean } | { ok: false; error: string }

export async function offlineOrQueue(
  action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  queueType: PendingType,
  queuePayload: Record<string, unknown>,
): Promise<OfflineResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    await enqueue({ type: queueType, payload: queuePayload })
    return { ok: true, queued: true }
  }

  const res = await action()
  if (!res.ok) return { ok: false, error: res.error }
  return { ok: true, queued: false }
}
