import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit'

const schema = z.object({
  endpoint: z.string().url().max(4096),
  keys: z.object({
    p256dh: z.string().min(1).max(1024),
    auth: z.string().min(1).max(1024),
  }),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const rateLimit = await checkRateLimit(apiLimiter, `push-subscribe:${user.id}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    const unavailable = rateLimit.error.startsWith('تعذر')
    return NextResponse.json(
      { ok: false, error: rateLimit.error },
      {
        status: unavailable ? 503 : 429,
        headers: unavailable ? { 'Retry-After': '60' } : {},
      },
    )
  }

  const contentLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(contentLength) && contentLength > 8192) {
    return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
  }

  const body = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const { endpoint, keys } = parsed.data

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      user_agent: (request.headers.get('user-agent') ?? '').slice(0, 500) || null,
      last_used_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  )

  if (error) {
    console.error('[push/subscribe] database write failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذر حفظ إعدادات الإشعارات' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
