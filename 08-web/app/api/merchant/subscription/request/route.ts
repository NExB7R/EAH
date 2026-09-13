import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Body = z.object({
  businessId: z.string().uuid(),
  planId: z.string().uuid(),
  notes: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

    const parsed = Body.safeParse(await request.json().catch(() => null))
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 })
    }
    const { businessId, planId, notes } = parsed.data

    // تأكد إن المستخدم مالك النشاط
    const { data: biz } = await supabase
      .from('businesses')
      .select('id, owner_profile_id')
      .eq('id', businessId)
      .maybeSingle()
    if (!biz) return NextResponse.json({ ok: false, error: 'business_not_found' }, { status: 404 })
    if (biz.owner_profile_id !== user.id) {
      return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
    }

    // تأكد إن مفيش طلب pending أو اشتراك نشط
    const { data: existing } = await supabase
      .from('business_subscriptions')
      .select('id, status')
      .eq('business_id', businessId)
      .in('status', ['pending', 'trial', 'active'])
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'already_has_subscription', status: existing.status },
        { status: 409 }
      )
    }

    // أنشئ الطلب
    const { data: created, error } = await supabase
      .from('business_subscriptions')
      .insert({
        business_id: businessId,
        plan_id: planId,
        status: 'pending',
        notes: notes ?? null,
      })
      .select('id')
      .single()

    if (error || !created) {
      return NextResponse.json({ ok: false, error: error?.message ?? 'insert_failed' }, { status: 500 })
    }

    // سجل الحدث
    await supabase.from('subscription_events').insert({
      subscription_id: created.id,
      business_id: businessId,
      event_type: 'requested',
      actor_id: user.id,
      metadata: { plan_id: planId, notes: notes ?? null },
    })

    return NextResponse.json({ ok: true, id: created.id })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
