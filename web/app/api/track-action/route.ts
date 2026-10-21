import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'
import { strictLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  action: z.enum(['phone_reveal', 'whatsapp', 'review', 'comment']),
  businessId: z.string().uuid(),
})

function hashIp(ip: string): string | null {
  // A known fallback salt is not an anonymization secret. The DB column is
  // nullable, so omit the IP fingerprint if the dedicated secret is missing.
  const salt = process.env.EAH_VISITOR_SALT
  if (!salt) return null
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16)
}

export async function POST(req: NextRequest) {
  try {
    const ip = await getClientIp()
    const rateLimit = await checkRateLimit(strictLimiter, `track-action:${ip}`, {
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
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
    }

    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase.from('engagement_events').insert({
      business_id: parsed.data.businessId,
      action: parsed.data.action,
      ip_hash: hashIp(ip),
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    })

    if (error) {
      console.error('[track-action] event insert failed:', error.message)
      return NextResponse.json({ ok: false, error: 'تعذر تسجيل التفاعل' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[track-action] request failed:', (error as Error).message)
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل التفاعل' }, { status: 500 })
  }
}
