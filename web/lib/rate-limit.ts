import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// ═══════════════════════════════════════════════════════════
// EAH — Rate Limiting (Upstash Redis)
// ═══════════════════════════════════════════════════════════
// Vercel serverless مفيش shared state → Upstash Redis
// 3 limiters: auth / api / strict
// ═══════════════════════════════════════════════════════════

const redis = Redis.fromEnv()

// ─── Auth: تسجيل / دخول ───
export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:auth',
})

// ─── API: general routes ───
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
})

// ─── Strict: عمليات حساسة (report / review / reply) ───
export const strictLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:strict',
})

// ─── Admin media uploads (bounded bandwidth/cost) ───
export const adminUploadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '15 m'),
  analytics: true,
  prefix: 'ratelimit:admin-upload',
})

// ─── Exports (bounded high-volume and personal-data downloads) ───
export const exportLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  analytics: true,
  prefix: 'ratelimit:export',
})

// ─── Strict: operations حساسة (review / reply / reveal) ───
export async function getClientIp(): Promise<string> {
  const h = await headers()

  // Prefer the single-address header supplied by the hosting proxy. The first
  // X-Forwarded-For item may be user-supplied when requests pass through
  // multiple proxies, so only use the final proxy-appended item as fallback.
  const realIp = h.get('x-real-ip')?.trim()
  if (realIp) return realIp

  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const addresses = forwarded.split(',').map((value) => value.trim()).filter(Boolean)
    const lastAddress = addresses.at(-1)
    if (lastAddress) return lastAddress
  }

  return 'unknown'
}

// ─── Helper: rate limit check ───
export type RateLimitResult =
  { ok: true; remaining: number } | { ok: false; error: string; retryAfter: number }

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  options: { failClosed?: boolean } = {},
): Promise<RateLimitResult> {
  try {
    const { success, remaining, reset } = await limiter.limit(identifier)
    if (success) return { ok: true, remaining }
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    return { ok: false, error: 'محاولات كتير — جرب بعد شوية', retryAfter }
  } catch {
    // Sensitive endpoints can opt out of fail-open behavior. Keep the
    // legacy default for non-critical flows until each caller is reviewed.
    if (options.failClosed) {
      return {
        ok: false,
        error: 'تعذر التحقق الأمني مؤقتًا — جرب كمان دقيقة',
        retryAfter: 60,
      }
    }
    return { ok: true, remaining: 0 }
  }
}
