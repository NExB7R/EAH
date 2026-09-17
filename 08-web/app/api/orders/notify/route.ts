import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'
import { checkRate, getClientIp } from '@/lib/security/rate-limit'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { ok } = checkRate(`order-notify:${ip}`, 20, 60_000)
  if (!ok) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 })

  const body = await request.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })

  const supabase = await createClient()
  const { data: order } = await supabase
    .from('order_requests')
    .select('id, business_id, customer_name, customer_phone, items_summary')
    .eq('id', parsed.data.orderId)
    .maybeSingle()

  if (!order) return NextResponse.json({ ok: false }, { status: 404 })

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id, name, slug')
    .eq('id', order.business_id)
    .maybeSingle()

  if (!biz?.owner_profile_id) return NextResponse.json({ ok: false, error: 'no_owner' })

  const result = await sendPushToUser(biz.owner_profile_id, {
    title: `طلب جديد من ${order.customer_name}`,
    body: order.items_summary.slice(0, 100),
    url: '/merchant/orders',
  })

  return NextResponse.json({ ok: true, ...result })
}
