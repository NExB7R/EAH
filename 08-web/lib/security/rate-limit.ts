type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Cleanup كل 5 دقايق
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [k, v] of buckets.entries()) {
      if (now > v.resetAt) buckets.delete(k)
    }
  }, 5 * 60 * 1000)
}

export function checkRate(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const b = buckets.get(key)

  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (b.count >= limit) {
    return { ok: false, remaining: 0, resetAt: b.resetAt }
  }

  b.count++
  return { ok: true, remaining: limit - b.count, resetAt: b.resetAt }
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}
