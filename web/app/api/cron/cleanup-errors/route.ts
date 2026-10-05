import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { logError } from '@/lib/logging/errors'

// ═══════════════════════════════════════════════════════════
// EAH — Cron: System Errors Retention (90 يوم)
// ═══════════════════════════════════════════════════════════

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

    const { count } = await supabase
      .from('system_errors')
      .delete({ count: 'exact' })
      .lt('created_at', cutoff)

    return NextResponse.json({ ok: true, deleted: count ?? 0 })
  } catch (err) {
    await logError({
      severity: 'medium',
      source: 'cron',
      message: err instanceof Error ? err.message : String(err),
      path: '/api/cron/cleanup-errors',
    })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
