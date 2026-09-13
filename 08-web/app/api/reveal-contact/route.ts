import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase-server'

const VALID_METHODS = ['phone','whatsapp','email','website','instagram','facebook'] as const
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Simple in-memory rate limit (per instance; use Upstash/Redis for production scale)
const RATE = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20          // 20 reveals
const RATE_WINDOW_MS = 60_000  // per minute

function checkRate(ip: string): boolean {
  const now = Date.now()
  const bucket = RATE.get(ip)
  if (!bucket || now > bucket.resetAt) {
    RATE.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (bucket.count >= RATE_LIMIT) return false
  bucket.count++
  return true
}

function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? '0.0.0.0'
}

/**
 * السيرفر هو اللي بيحسب الـ hash النهائي.
 * العميل مش بيثق فيه — بس بيدي token مميّز.
 */
function deriveVisitorHash(
  ip: string,
  ua: string,
  clientToken: string,
  salt: string
): string {
  return createHash('sha256')
    .update(`${salt}|${ip}|${ua}|${clientToken}`)
    .digest('hex')  // 64 حرف hex ✓
}

export async function POST(req: Request) {
  try {
    // ── 1) Parse + validate body
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 })
    }

    const { business_id, method_type, client_token } = body as Record<string, unknown>

    if (typeof business_id !== 'string' || !UUID_RE.test(business_id)) {
      return NextResponse.json({ ok: false, error: 'invalid_business_id' }, { status: 400 })
    }
    if (typeof method_type !== 'string' || !VALID_METHODS.includes(method_type as any)) {
      return NextResponse.json({ ok: false, error: 'invalid_method_type' }, { status: 400 })
    }
    if (typeof client_token !== 'string' || client_token.length < 8 || client_token.length > 100) {
      return NextResponse.json({ ok: false, error: 'invalid_client_token' }, { status: 400 })
    }

    // ── 2) Rate limit
    const ip = getClientIp(req)
    if (!checkRate(ip)) {
      return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })
    }

    // ── 3) Server-side hash
    const salt = process.env.EAH_VISITOR_SALT ?? ''
    if (!salt) {
      console.error('[reveal-contact] EAH_VISITOR_SALT missing')
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    }

    const ua = req.headers.get('user-agent') ?? 'unknown'
    const visitor_hash = deriveVisitorHash(ip, ua, client_token, salt)

    // ── 4) Call RPC
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('reveal_contact', {
      p_business_id: business_id,
      p_method_type: method_type,
      p_visitor_hash: visitor_hash,
    })

    if (error) {
      // validation errors from DB → 400
      if (error.code === '22023' || error.message.includes('invalid')) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
      }
      console.error('[reveal-contact] rpc error:', error)
      return NextResponse.json({ ok: false, error: 'rpc_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ...(data as object) })
  } catch (err) {
    console.error('[reveal-contact] unexpected:', err)
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 })
  }
}
