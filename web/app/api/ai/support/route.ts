import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runSupport } from '@/lib/ai/support'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().max(2000),
      }),
    )
    .max(6)
    .optional(),
})

let limiter: Ratelimit | null = null

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  limiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '10 m'),
    analytics: false,
    prefix: 'support-bot',
  })
  return limiter
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let rl: Ratelimit | null
  try {
    rl = getLimiter()
  } catch {
    return NextResponse.json({ ok: false, error: 'خدمة الدعم غير متاحة مؤقتًا' }, { status: 503 })
  }
  if (!rl) {
    return NextResponse.json({ ok: false, error: 'خدمة الدعم غير متاحة مؤقتًا' }, { status: 503 })
  }

  const key = user?.id ?? (await getClientIp())
  try {
    const { success } = await rl.limit(key)
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'عدد كبير من الأسئلة — استنى 10 دقايق' },
        { status: 429 },
      )
    }
  } catch {
    return NextResponse.json({ ok: false, error: 'خدمة الدعم غير متاحة مؤقتًا' }, { status: 503 })
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 16_384) {
    return NextResponse.json({ ok: false, error: 'حجم الرسالة أكبر من المسموح' }, { status: 413 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'رسالة غير صحيحة' }, { status: 400 })
  }

  const res = await runSupport(parsed.data.message, parsed.data.history ?? [])

  if (!res.ok) {
    return NextResponse.json(res, { status: 500 })
  }
  return NextResponse.json(res)
}
