import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'
import { getClientIp, strictLimiter, checkRateLimit } from '@/lib/rate-limit'

const schema = z.object({
  businessId: z.string().uuid(),
  method: z.enum(['phone', 'whatsapp']),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(strictLimiter, `track-contact:${user.id}:${ip}`, {
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

  // visitor_hash = sha256(user.id + business.id + method)
  // يمنع التضخيم من نفس المستخدم
  const visitorHash = createHash('sha256')
    .update(`${user.id}:${parsed.data.businessId}:${parsed.data.method}`)
    .digest('hex')

  const { error } = await supabase.rpc('reveal_contact', {
    p_business_id: parsed.data.businessId,
    p_method_type: parsed.data.method,
    p_visitor_hash: visitorHash,
  })

  if (error) {
    console.error('[track-contact] contact event failed:', error.message)
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل العملية' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
