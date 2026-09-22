import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'
import { notifyPendingDecision } from '@/lib/admin/pending-notifications'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  pendingId: z.string().uuid(),
  status: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(500).optional(),
})

async function isSuperAdmin() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .maybeSingle()

    return Boolean(role)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  if (!(await isSuperAdmin())) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })

  try {
    const result = await notifyPendingDecision(
      parsed.data.pendingId,
      parsed.data.status,
      parsed.data.note,
    )
    if (result === 'not_found') {
      return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'notification_failed' }, { status: 500 })
  }
}
