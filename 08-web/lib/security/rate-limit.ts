/**
 * EAH Rate Limiting
 * Strategy: In-memory (fast) → DB fallback for distributed needs.
 * Uses sliding window approximation.
 *
 * Usage:
 *   const { ok, remaining } = await checkRate('login:ip', 10, 60_000)
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
    const now = new Date()
    const resetAt = new Date(now.getTime() + windowMs)

    // upsert مع increment
    const { data: existing } = await supabase
      .from('rate_limits')
      .select('count,reset_at')
      .eq('key', key)
      .maybeSingle()

    if (!existing || new Date(existing.reset_at) < now) {
      await supabase
        .from('rate_limits')
        .upsert({ key, count: 1, reset_at: resetAt.toISOString() }, { onConflict: 'key' })
      return { ok: true, remaining: limit - 1, resetAt: resetAt.getTime() }
    }

    if (existing.count >= limit) {
      return {
        ok: false,
        remaining: 0,
        resetAt: new Date(existing.reset_at).getTime(),
      }
    }

    const newCount = existing.count + 1
    await supabase.from('rate_limits').update({ count: newCount }).eq('key', key)
    return {
      ok: true,
      remaining: limit - newCount,
      resetAt: new Date(existing.reset_at).getTime(),
    }
  } catch {
    // fallback → memory
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
