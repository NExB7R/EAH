import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({}),
  },
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static slidingWindow(limit: number, window: string) {
      return { limit, window }
    }

    constructor() {}
  },
}))

import type { Ratelimit } from '@upstash/ratelimit'
import { checkRateLimit } from './rate-limit'

function makeLimiter(result: unknown): Ratelimit {
  return {
    limit: vi.fn().mockResolvedValue(result),
  } as unknown as Ratelimit
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('checkRateLimit', () => {
  it('allows a request when the shared limiter succeeds', async () => {
    const limiter = makeLimiter({
      success: true,
      remaining: 4,
      reset: Date.now() + 60_000,
    })

    await expect(checkRateLimit(limiter, 'user:1', true)).resolves.toEqual({
      ok: true,
      remaining: 4,
    })
  })

  it('returns a retryable denial when the request limit is exhausted', async () => {
    const limiter = makeLimiter({
      success: false,
      remaining: 0,
      reset: Date.now() + 10_000,
    })

    const result = await checkRateLimit(limiter, 'user:1', true)

    expect(result.ok).toBe(false)
    if (result.ok) throw new Error('Expected rate-limit denial')
    expect(result.retryAfter).toBeGreaterThan(0)
    expect(result.unavailable).toBeUndefined()
  })

  it('fails closed when a sensitive endpoint cannot reach the limiter', async () => {
    const limiter = {
      limit: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
    } as unknown as Ratelimit

    await expect(checkRateLimit(limiter, 'sensitive:user:1', true)).resolves.toEqual({
      ok: false,
      error: 'خدمة الحماية غير متاحة مؤقتًا — حاول لاحقًا',
      retryAfter: 30,
      unavailable: true,
    })
  })

  it('preserves availability-first behavior for non-sensitive endpoints', async () => {
    const limiter = {
      limit: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
    } as unknown as Ratelimit

    await expect(checkRateLimit(limiter, 'general:user:1')).resolves.toEqual({
      ok: true,
      remaining: 0,
    })
  })
})
