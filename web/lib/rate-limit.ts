import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { getTrustedClientIp } from '@/lib/auth/client-ip'

// ═══════════════════════════════════════════════════════════
// EAH — Rate Limiting (Upstash Redis)
// ═══════════════════════════════════════════════════════════
// Vercel serverless has no shared state → Upstash Redis
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

export async function getClientIp(): Promise<string> {
  const h = await headers()
  return getTrustedClientIp(h)
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; error: string; retryAfter: number; unavailable?: true }

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string,
  failClosed = false,
): Promise<RateLimitResult> {
  try {
    const { success, remaining, reset } = await limiter.limit(identifier)
    if (success) return { ok: true, remaining }
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000))
    return { ok: false, error: 'محاولات كتير — جرب بعد شوية', retryAfter }
  } catch {
    // Sensitive endpoints can fail closed when the shared limiter is unavailable.
    if (failClosed) {
      return {
        ok: false,
        error: 'خدمة الحماية غير متاحة مؤقتًا — حاول لاحقًا',
        retryAfter: 30,
        unavailable: true,
      }
    }

    // Preserve the existing availability-first behavior for other endpoints.
    return { ok: true, remaining: 0 }
  }
}
