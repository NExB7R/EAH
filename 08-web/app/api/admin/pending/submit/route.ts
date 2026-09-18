import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { submitPendingChange } from '@/lib/admin/pending'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  action: z.string().min(2).max(60),
  entity_type: z.string().min(2).max(40),
  entity_id: z.string().uuid().nullable(),
  payload: z.record(z.string(), z.unknown()),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })

  const r = await submitPendingChange({
    action: parsed.data.action as any,
    entityType: parsed.data.entity_type,
    entityId: parsed.data.entity_id,
    payload: parsed.data.payload as Record<string, unknown>,
  })

  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: 500 })

  // ابعت إشعار للأدمنز
  try {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/admin/pending/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingId: r.id }),
    })
  } catch { /* silent */ }

  return NextResponse.json({ ok: true, id: r.id })
}
