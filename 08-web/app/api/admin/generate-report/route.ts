import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).maybeSingle()
  if (role?.role !== 'super_admin') {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const body = await req.json().catch(() => ({}))
  const { businessId, monthKey } = body as { businessId?: string; monthKey?: string }

  const svc = createServiceClient()

  if (businessId && monthKey) {
    const { data, error } = await svc.rpc('generate_monthly_report', {
      p_business_id: businessId,
      p_month_key: monthKey,
    })
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await svc.rpc('generate_all_monthly_reports', {
    p_month_key: monthKey ?? null,
  })
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
