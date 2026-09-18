import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase-server'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'
import { UUID } from '@/lib/security/validate'
import { trackEvent } from '@/lib/analytics/track'

const VALID_METHODS = ['phone','whatsapp','email','website','instagram','facebook'] as const
const RATE_LIMIT = 20
const RATE_WINDOW = 60_000

function deriveVisitorHash(ip: string, ua: string, clientToken: string, salt: string) {
  return createHash('sha256').update(`${salt}|${ip}|${ua}|${clientToken}`).digest('hex')
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
    }

    const { business_id, method_type, client_token } = body as Record<string, unknown>

    const uuidCheck = UUID.safeParse(business_id)
    if (!uuidCheck.success) return NextResponse.json({ ok: false, error: 'invalid_business_id' }, { status: 400 })

    if (typeof method_type !== 'string' || !VALID_METHODS.includes(method_type as any)) {
      return NextResponse.json({ ok: false, error: 'invalid_method_type' }, { status: 400 })
    }
    if (typeof client_token !== 'string' || client_token.length < 8 || client_token.length > 100) {
      return NextResponse.json({ ok: false, error: 'invalid_client_token' }, { status: 400 })
    }

    const ip = getClientIp(req)
    const { ok } = checkRate(`reveal:${ip}`, RATE_LIMIT, RATE_WINDOW)
    if (!ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

    const salt = process.env.EAH_VISITOR_SALT ?? ''
    if (!salt) return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })

    const ua = req.headers.get('user-agent') ?? 'unknown'
    const visitor_hash = deriveVisitorHash(ip, ua, client_token, salt)

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('reveal_contact', {
      p_business_id: uuidCheck.data,
      p_method_type: method_type,
      p_visitor_hash: visitor_hash,
    })

    if (error) {
      if (error.code === '22023' || error.message.includes('invalid')) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      }
      return NextResponse.json({ ok: false, error: 'rpc_failed' }, { status: 500 })
    }

    // log زيارة فريدة (نقاط تلقائية)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.rpc('log_unique_visit', {
          p_business_id: uuidCheck.data,
          p_visit_type: 'phone_reveal',
        })
      }
    } catch { /* silent */ }

    // analytics: business_reveal
    await trackEvent({
      scope: 'business_reveal',
      businessId: uuidCheck.data,
      metadata: { method: method_type },
    })

    return NextResponse.json({ ok: true, ...(data as object) })
  } catch {
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
