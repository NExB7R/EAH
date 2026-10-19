import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createNotification } from '@/lib/notifications/server'
import { verifyCron } from '@/lib/auth/cron'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — Cron: Review Reminder
// كل ساعة — يجيب الطلبات المسلّمة من 2-24 ساعة
// + ملحقتش تتقيّم → يبعت push
// ═══════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
  const denied = verifyCron(req)
  if (denied) return denied

  const supabase = createServiceClient()

  const now = Date.now()
  const from = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const to = new Date(now - 2 * 60 * 60 * 1000).toISOString()

  // طلبات مسلّمة من 2-24 ساعة + مفيش review_reminder_sent_at
  const { data: orders, error } = await supabase
    .from('order_requests')
    .select('id, business_id, customer_profile_id, updated_at, customer_name')
    .eq('status', 'delivered')
    .is('review_reminder_sent_at', null)
    .gte('updated_at', from)
    .lte('updated_at', to)
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ sent: 0, checked: 0 })
  }

  let sent = 0

  for (const o of orders) {
    // افحص المستخدم مقيّمش النشاط
    const { data: existingReview } = await supabase
      .from('business_reviews')
      .select('id')
      .eq('business_id', o.business_id)
      .eq('user_id', o.customer_profile_id)
      .maybeSingle()

    if (existingReview) {
      // مقيّم خلاص — علّم عليه بدون إشعار
      await supabase
        .from('order_requests')
        .update({ review_reminder_sent_at: new Date().toISOString() })
        .eq('id', o.id)
      continue
    }

    // جيب slug + اسم النشاط
    const { data: biz } = await supabase
      .from('businesses')
      .select('slug, name')
      .eq('id', o.business_id)
      .maybeSingle()

    if (!biz?.slug) continue

    // إشعار push
    try {
      await createNotification({
        userId: o.customer_profile_id,
        type: 'system',
        title: `قيّم تجربتك في ${biz.name}`,
        body: 'رأيك يساعد غيرك ويعلي تقييم النشاط',
        deepLink: `/businesses/${biz.slug}?review=1`,
        push: true,
        pushTag: `review-reminder-${o.id}`,
      })
      sent++

      await supabase
        .from('order_requests')
        .update({ review_reminder_sent_at: new Date().toISOString() })
        .eq('id', o.id)
    } catch {
      // تجاهل الفشل الفردي
    }
  }

  return NextResponse.json({ sent, checked: orders.length })
}
