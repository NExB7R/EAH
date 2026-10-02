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

// ─── Strict: operations حساسة (review / reply / reveal) ───
export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown'
  return h.get('x-real-ip') ?? 'unknown'
}

// ─── Helper: rate limit check ───
export type RateLimitResult =
  { ok: true; remaining: number } | { ok: false; error: string; retryAfter: number }

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
): Promise<RateLimitResult> {
  try {
    const { success, remaining, reset } = await limiter.limit(identifier)
    if (success) return { ok: true, remaining }
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    return { ok: false, error: 'محاولات كتير — جرب بعد شوية', retryAfter }
  } catch {
    // لو Upstash واقع → نسمح (fail-open) عشان منعطلش المستخدمين
    return { ok: true, remaining: 0 }
  }
}
