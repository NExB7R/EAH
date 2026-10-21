import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logError } from '@/lib/logging/errors'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { strictLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  path: z.string().max(500).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
})

export async function POST(req: Request) {
  try {
    const h = await headers()
    const ip = await getClientIp()
    const rateLimit = await checkRateLimit(strictLimiter, `log-error:${ip}`, {
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

    const contentLength = Number(req.headers.get('content-length') ?? '0')
    if (Number.isFinite(contentLength) && contentLength > 16_384) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
    }

    const raw = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'بيانات الخطأ غير صحيحة' }, { status: 400 })
    }

    let userId: string | undefined
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      userId = data.user?.id
    } catch {
      // Error logging must still work for anonymous visitors.
    }

    const userAgent = (h.get('user-agent') ?? '').slice(0, 500)

    await logError({
      severity: parsed.data.severity ?? 'medium',
      source: 'client',
      message: parsed.data.message,
      stack: parsed.data.stack,
      path: parsed.data.path,
      userId,
      metadata: { userAgent },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[log-error] failed to store client error:', (error as Error).message)
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل الخطأ' }, { status: 500 })
  }
}
