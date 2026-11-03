import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  businessId: z.string().uuid(),
  visitorId: z.string().uuid(),
  sessionId: z.string().uuid(),
})

function getDeviceType(userAgent: string): string {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return 'tablet'
  if (/mobile|android|iphone|ipod/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

function safeReferrer(value: string | null): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    // Retain only the referring hostname; paths and query strings may contain
    // sensitive identifiers or tokens and are not needed for this signal.
    return url.hostname.slice(0, 255)
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get('content-length') ?? '0')
    if (Number.isFinite(contentLength) && contentLength > 2048) {
      return NextResponse.json({ ok: false, error: 'payload_too_large' }, { status: 413 })
    }

    const body = await request.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_payload' }, { status: 400 })
    }

    const ip = await getClientIp()
    const rateLimit = await checkRateLimit(apiLimiter, `business-view:${ip}`, {
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

    const supabase = createServiceClient()
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, slug')
      .eq('id', parsed.data.businessId)
      .eq('is_published', true)
      .maybeSingle()

    if (businessError) {
      console.error('[track-business-view] business lookup failed:', businessError.message)
      return NextResponse.json({ ok: false, error: 'تعذر التحقق من النشاط' }, { status: 500 })
    }
    if (!business) {
      return NextResponse.json({ ok: false, error: 'النشاط مش متاح' }, { status: 404 })
    }

    const since = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    const { data: existing, error: duplicateError } = await supabase
      .from('page_view_events')
      .select('id')
      .eq('business_id', business.id)
      .eq('visitor_id', parsed.data.visitorId)
      .eq('session_id', parsed.data.sessionId)
      .eq('event_scope', 'business')
      .gte('occurred_at', since)
      .limit(1)
      .maybeSingle()

    if (duplicateError) {
      console.error('[track-business-view] duplicate lookup failed:', duplicateError.message)
      return NextResponse.json({ ok: false, error: 'تعذر تسجيل الزيارة' }, { status: 500 })
    }
    if (existing) return NextResponse.json({ ok: true, recorded: false })

    const referrer = safeReferrer(request.headers.get('referer'))
    const userAgent = request.headers.get('user-agent')?.slice(0, 500) ?? ''
    const { error: insertError } = await supabase.from('page_view_events').insert({
      business_id: business.id,
      path: `/businesses/${business.slug}`,
      visitor_id: parsed.data.visitorId,
      session_id: parsed.data.sessionId,
      event_scope: 'business',
      referrer,
      device_type: getDeviceType(userAgent),
    })

    if (insertError) {
      console.error('[track-business-view] insert failed:', insertError.message)
      return NextResponse.json({ ok: false, error: 'تعذر تسجيل الزيارة' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, recorded: true })
  } catch (error) {
    console.error('[track-business-view] request failed:', (error as Error).message)
    return NextResponse.json({ ok: false, error: 'تعذر تسجيل الزيارة' }, { status: 500 })
  }
}
