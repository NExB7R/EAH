import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runAgent } from '@/lib/ai/agent'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ═══════════════════════════════════════════════════════════
// EAH — AI Chat API
//   • Auth-aware (user.id من الجلسة)
//   • Rate limited (10 / 10m / user)
//   • History validated (roles محددة، طول محدود، آخر 6)
// ═══════════════════════════════════════════════════════════

// حقن محتمل من history
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)/i,
  /forget\s+(all\s+)?(previous|prior|above)/i,
  /system\s*:/i,
  /you\s+are\s+now/i,
  /new\s+instructions/i,
  /انسى\s+(كل\s+)?التعليمات/i,
  /تجاهل\s+(كل\s+)?(التعليمات|الأوامر)/i,
  /دور\s+جديد/i,
  /أنت\s+الآن/i,
]

const schema = z.object({
  message: z
    .string()
    .min(1)
    .max(500)
    .transform((s) => s.trim()),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(1500),
      }),
    )
    .max(6)
    .optional()
    .default([]),
})

function hasInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((re) => re.test(text))
}

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
  try {
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

    const { message, history } = parsed.data

    // حماية ضد prompt injection
    if (hasInjection(message)) {
      return NextResponse.json(
        {
          ok: true,
          reply: 'مش هينفع يا صاحبي 😅 أنا هنا أساعدك تكتشف أماكن قريبة منك. تحب تبدأ بإيه؟',
        },
        { status: 200 },
      )
    }

    // فلتر الـ history من أي حقن
    const safeHistory = history.filter((m) => !hasInjection(m.content))

    const res = await runAgent(message, safeHistory)

    if (!res.ok) {
      const isDev = process.env.NODE_ENV !== 'production'
      const errMsg = isDev && res.error ? `[DEV] ${res.error}` : res.error
      return NextResponse.json({ ok: false, error: errMsg }, { status: 500 })
    }
    return NextResponse.json(res)
  } catch (err) {
    console.error('[AI Chat API]', (err as Error).message)
    return NextResponse.json({ ok: false, error: 'حصلت مشكلة — جرب تاني' }, { status: 500 })
  }
}
