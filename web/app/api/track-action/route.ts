import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createHash } from 'crypto'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — POST /api/track-action
//   يسجّل تفاعل (كشف رقم / واتساب / تقييم / تعليق)
//   للتحليلات والتقارير
// ═══════════════════════════════════════════════════════════

function hashIp(ip: string): string {
  const salt = process.env.EAH_VISITOR_SALT ?? 'eah-default-salt'
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 16)
}

const ALLOWED = new Set(['phone_reveal', 'whatsapp', 'review', 'comment'])

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const { action, businessId } = body as {
      action?: string
      businessId?: string
    }
    if (!action || !ALLOWED.has(action) || !businessId) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    const rl = await checkRateLimit(strictLimiter, `track-action:${ip}`)
    if (!rl.ok) {
      return NextResponse.json({ ok: false, error: rl.error }, { status: 429 })
    }

    const supabase = createServiceClient()
    await supabase.from('engagement_events').insert({
      business_id: businessId,
      action,
      ip_hash: hashIp(ip),
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
