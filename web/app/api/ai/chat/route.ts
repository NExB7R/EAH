import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runAgent } from '@/lib/ai/agent'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ═══════════════════════════════════════════════════════════
// EAH — AI Chat API
// Rate limited: 10 أسئلة / 10 دقايق / user
// ═══════════════════════════════════════════════════════════

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
    limiter: Ratelimit.slidingWindow(10, '10 m'),
    analytics: false,
    prefix: 'ai-chat',
  })
  return limiter
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rate limit
  const rl = getLimiter()
  if (rl) {
    const key = user?.id ?? request.headers.get('x-forwarded-for') ?? 'anon'
    const { success } = await rl.limit(key)
    if (!success) {
      return NextResponse.json(
        { ok: false, error: 'عدد كبير من الأسئلة — استنى شوية وجرب تاني' },
        { status: 429 },
      )
    }
  }

  const body = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'رسالة غير صحيحة' }, { status: 400 })
  }

  const res = await runAgent(parsed.data.message, parsed.data.history ?? [])

  if (!res.ok) {
    return NextResponse.json(res, { status: 500 })
  }
  return NextResponse.json(res)
}
