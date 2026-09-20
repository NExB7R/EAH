import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET}`
  if (process.env.CRON_SECRET && authHeader !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()

  const { data: orders, error } = await supabase
    .from('order_requests')
    .select('id, business_id, customer_user_id, confirmed_at, business:businesses(name, slug)')
    .not('confirmed_at', 'is', null)
    .is('review_reminder_sent_at', null)
    .lt('confirmed_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
    .gt('confirmed_at', new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString())
    .limit(50)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 })
  }

  let sent = 0
  const succeededIds: string[] = []

  for (const order of orders) {
    const biz = (order as any).business
    if (!biz) continue
    try {
      if (order.customer_user_id) {
        await sendPushToUser(order.customer_user_id, {
          type: 'review_replies',
          title: `رأيك يهمنا في ${biz.name}`,
          body: 'قيّم تجربتك واكسب +10 نقاط — دقيقة واحدة وخلّي رأيك يوصل',
          url: `/businesses/${biz.slug}#review`,
        })
      }
      succeededIds.push(order.id)
      sent++
    } catch {}
  }

  if (succeededIds.length > 0) {
    await supabase
      .from('order_requests')
      .update({ review_reminder_sent_at: new Date().toISOString() })
      .in('id', succeededIds)
  }

  return NextResponse.json({ ok: true, sent, total: orders.length })
}
