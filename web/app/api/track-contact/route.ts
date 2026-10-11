import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'
import { checkRateLimit, getClientIp, strictLimiter } from '@/lib/rate-limit'

const schema = z.object({
  businessId: z.string().uuid(),
  method: z.enum(['phone', 'whatsapp']),
})

function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('Cache-Control', 'no-store')
  return NextResponse.json(body, { ...init, headers })
}

function rateLimitResponse(result: { error: string; retryAfter: number; unavailable?: true }) {
  return jsonNoStore(
    { ok: false, error: result.error },
    {
      status: result.unavailable ? 503 : 429,
      headers: { 'Retry-After': String(Math.max(1, result.retryAfter)) },
    },
  )
}

export async function POST(request: Request) {
  const ip = await getClientIp()
  const ipLimit = await checkRateLimit(strictLimiter, `track-contact:${ip}`, true)

  if (!ipLimit.ok) return rateLimitResponse(ipLimit)

  const body: unknown = await request.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return jsonNoStore({ ok: false, error: 'invalid' }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return jsonNoStore({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  // A second independent cap prevents easy bypass by rotating IPs between requests.
  const userLimit = await checkRateLimit(strictLimiter, `track-contact-user:${user.id}`, true)
  if (!userLimit.ok) return rateLimitResponse(userLimit)

  // visitor_hash = sha256(user.id + business.id + method); the client never chooses this hash.
  const visitorHash = createHash('sha256')
    .update(`${user.id}:${parsed.data.businessId}:${parsed.data.method}`)
    .digest('hex')

  // The underlying RPC is service-role-only. It can only receive a verified user-derived hash here.
  try {
    const serviceClient = createServiceClient()
    const { error } = await serviceClient.rpc('reveal_contact', {
      p_business_id: parsed.data.businessId,
      p_method_type: parsed.data.method,
      p_visitor_hash: visitorHash,
    })

    if (error) {
      console.error('[Track Contact] Failed to record contact reveal:', error.message)
      return jsonNoStore({ ok: false, error: 'tracking_unavailable' }, { status: 503 })
    }

    return jsonNoStore({ ok: true })
  } catch (error) {
    console.error('[Track Contact] Failed to record contact reveal:', error)
    return jsonNoStore({ ok: false, error: 'tracking_unavailable' }, { status: 503 })
  }
}
