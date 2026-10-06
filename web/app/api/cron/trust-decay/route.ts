import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logError, captureException } from '@/lib/logging/errors'

// ═══════════════════════════════════════════════════════════
// EAH — Cron: Trust Decay (يومي — 3 صباحاً)
//   يستدعي apply_trust_decay() لتناقص trust غير النشطين
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase.rpc('apply_trust_decay')

    if (error) {
      await logError({
        severity: 'medium',
        source: 'cron',
        message: `apply_trust_decay failed: ${error.message}`,
        path: '/api/cron/trust-decay',
      })
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: data })
  } catch (err) {
    await captureException(err, {
      severity: 'high',
      source: 'cron',
      path: '/api/cron/trust-decay',
    })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
