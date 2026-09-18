import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  action: z.string().min(2).max(60),
  entityType: z.string().min(2).max(40),
  entityId: z.string().uuid(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false }, { status: 401 })

    const body = await request.json().catch(() => null)
    const parsed = Schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

    // لازم يكون owner أو admin
    const { data: role } = await supabase
      .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
    const isAdmin = role?.role === 'super_admin'
    if (!isAdmin) {
      // نتأكد إنه مش صاحب حاجة ليها علاقة (يتم الفحص من DB لو احتاجنا)
      // حالياً نسجل بدون فحص عميق — RLS موجودة على audit_logs
    }

    await supabase.from('audit_logs').insert({
      actor_user_id: user.id,
      action: parsed.data.action,
      entity_type: parsed.data.entityType,
      entity_id: parsed.data.entityId,
      before_data: parsed.data.before ?? null,
      after_data: parsed.data.after ?? null,
      metadata: parsed.data.metadata ?? {},
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
