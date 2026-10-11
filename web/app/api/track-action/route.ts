import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { apiLimiter, checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { getHashedIp } from '@/lib/auth/ip'

// EAH — POST /api/track-action
// Anonymous engagement telemetry is intentional; keep input and write volume bounded.
const schema = z.object({
  action: z.enum(['phone_reveal', 'whatsapp', 'review', 'comment']),
  businessId: z.string().uuid(),
})

export async function POST(req: NextRequest) {
  const ip = await getClientIp()
  const rateLimit = await checkRateLimit(apiLimiter, `track-action:${ip}`, true)

  if (!rateLimit.ok) {
    return NextResponse.json(
      { ok: false, error: rateLimit.error },
      {
        status: rateLimit.unavailable ? 503 : 429,
        headers: {
          'Cache-Control': 'no-store',
          'Retry-After': String(Math.max(1, rateLimit.retryAfter)),
        },
      },
    )
  }

  const body: unknown = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'invalid' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('engagement_events').insert({
      business_id: parsed.data.businessId,
      action: parsed.data.action,
      // Never persist the raw IP address in the analytics table.
      ip_hash: await getHashedIp(),
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    })

    if (error) {
      console.error('[Track Action] Failed to insert engagement event:', error.message)
      return NextResponse.json(
        { ok: false, error: 'tracking_unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[Track Action] Failed to record engagement event:', error)
    return NextResponse.json(
      { ok: false, error: 'tracking_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
