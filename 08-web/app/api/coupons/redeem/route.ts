import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(req: Request) {
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ ok: false, reason: 'unauth' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (typeof body?.coupon_id !== 'string') {
    return NextResponse.json({ ok: false, reason: 'bad_request' }, { status: 400 })
  }
  const { data, error } = await sb.rpc('redeem_coupon', {
    p_coupon: body.coupon_id,
    p_order: typeof body?.order_id === 'string' ? body.order_id : null,
  })
  if (error) return NextResponse.json({ ok: false, reason: 'server_error' }, { status: 500 })
  return NextResponse.json(data)
}
