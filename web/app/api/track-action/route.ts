import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — POST /api/track-action
//   يسجّل تفاعل (كشف رقم / واتساب / تقييم / تعليق)
//   للتحليلات والتقارير
// ═══════════════════════════════════════════════════════════

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

    const supabase = createServiceClient()
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    await supabase.from('engagement_events').insert({
      business_id: businessId,
      action,
      ip_hash: ip,
      user_agent: req.headers.get('user-agent')?.slice(0, 200) ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
