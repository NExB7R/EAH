import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Critical Error Pulse (poll every 30s)
// ═══════════════════════════════════════════════════════════

export async function GET() {
  const ctx = await requireAdmin()
  if (!ctx.ok) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
  }

  const svc = createServiceClient()
  const d1 = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count } = await svc
    .from('system_errors')
    .select('id', { count: 'exact', head: true })
    .eq('severity', 'critical')
    .is('resolved_at', null)
    .gte('created_at', d1)

  return NextResponse.json({ critical: count ?? 0 })
}
