/**
 * EAH Rate Limiting
 * Strategy:
 *  - checkRateDb (default for abuse-sensitive routes): atomic DB limiter
 *    (`consume_rate_limit` RPC) — distributed across serverless instances.
 *    Falls back to the in-memory limiter if the RPC is unavailable.
 *  - checkRate (in-memory): only for high-volume / low-abuse endpoints
 *    (e.g. analytics tracking) where a DB roundtrip per request is not worth it.
 *
 * Usage:
 *   const { ok, remaining } = await checkRateDb('login:ip', 10, 60_000)
 */

import { createServiceClient } from '@/lib/supabase-server'

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// تنضيف دوري — يمنع تسرب الذاكرة
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k)
  }
}

/**
 * فحص متزامن (sync) — للاستخدام السريع في routes
 * يعتمد على الذاكرة فقط — كافي لـ single instance Vercel
 */
export function checkRate(key: string, limit: number, windowMs: number) {
  cleanup()
  const now = Date.now()
  const b = buckets.get(key)

  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (b.count >= limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt }
  }

  b.count++
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt }
}

/**
 * فحص DB-backed (async) — للتوزيع الحقيقي
 * يخزن العداد في Supabase — صالح لـ multi-instance
 */
export async function checkRateDb(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ ok: boolean; remaining: number; resetAt: number }> {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('consume_rate_limit', {
      p_key: key.slice(0, 300),
      p_limit: limit,
      p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
    })
    if (error) throw error

    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new Error('empty_rate_limit_response')

    return {
      ok: Boolean(row.allowed),
      remaining: Number(row.remaining ?? 0),
      resetAt: new Date(row.reset_at).getTime(),
    }
  } catch {
    // Safe fallback for local development or before the migration is applied.
    return checkRate(key, limit, windowMs)
  }
}

/** استخراج IP من الهيدر */
export function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}
