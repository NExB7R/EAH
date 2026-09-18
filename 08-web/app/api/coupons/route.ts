import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase-server'

const schema = z.object({
  business_id: z.string().uuid(),
  code: z.string().trim().min(3).max(20).regex(/^[A-Za-z0-9_-]+$/).transform((v) => v.toUpperCase()),
  title: z.string().trim().min(3).max(80),
  description: z.string().trim().max(300).optional().nullable(),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z.coerce.number().positive(),
  min_order: z.coerce.number().min(0).default(0),
  max_uses: z.coerce.number().int().positive().nullable().optional(),
  per_user_limit: z.coerce.number().int().min(1).max(10).default(1),
  ends_at: z.string().datetime().nullable().optional(),
})

export async function POST(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request', issues: parsed.error.issues }, { status: 400 })
  }

  const { data: biz } = await sb
    .from('businesses')
    .select('id')
    .eq('id', parsed.data.business_id)
    .eq('owner_profile_id', user.id)
    .maybeSingle()
  if (!biz) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { data, error } = await sb
    .from('coupons')
    .insert({ ...parsed.data, status: 'pending', created_by: user.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, coupon: data })
}

export async function PATCH(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const id = body?.id
  const action = body?.action
  if (typeof id !== 'string' || !['approve', 'reject', 'toggle'].includes(action)) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const { data: role } = await sb
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'super_admin')
    .maybeSingle()
  if (!role) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  if (action === 'approve' || action === 'reject') {
    const { error } = await sb
      .from('coupons')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_note: typeof body?.note === 'string' ? body.note : null,
      })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await sb
      .from('coupons')
      .update({ is_active: !!body?.is_active })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
