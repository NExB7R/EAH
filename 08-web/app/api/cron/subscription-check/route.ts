import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { IcAlert } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'

/**
 * Cron: يُنادى مرة يومياً
 * 1. يُنشئ إشعارات للتاجرين اللي اشتراكهم بينتهي خلال 7 أيام (إشعار يومي)
 * 2. يشغّل expire_old_subscriptions() لإنهاء المنتهية
 *
 * Auth: يقبل الطلب لو
 * - Authorization: Bearer <CRON_SECRET>  (Vercel cron)
 * - أو ?key=<CRON_SECRET>
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const url = new URL(request.url)
    const provided =
      request.headers.get('authorization')?.replace('Bearer ', '') ??
      url.searchParams.get('key')
    if (provided !== secret) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
    }
  }

  try {
    const supabase = createServiceClient()
    const now = new Date()
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // 1. الاشتراكات اللي بتنتهي خلال 7 أيام
    const { data: expiring } = await supabase
      .from('business_subscriptions')
      .select(`
        id, business_id, expires_at, plan_id,
        business:businesses(name, owner_profile_id)
      `)
      .in('status', ['trial', 'active'])
      .gte('expires_at', now.toISOString())
      .lte('expires_at', in7Days)

    let notified = 0
    const today = now.toISOString().slice(0, 10)

    for (const sub of (expiring ?? []) as any[]) {
      const ownerId = sub.business?.owner_profile_id
      if (!ownerId) continue

      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(sub.expires_at).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      )

      // منع التكرار: هل أرسلنا إشعار اليوم؟
      const { data: existing } = await supabase
        .from('subscription_events')
        .select('id')
        .eq('subscription_id', sub.id)
        .eq('event_type', 'trial_expiring')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .maybeSingle()

      if (existing) continue

      // أنشئ إشعار
      await supabase.from('notifications').insert({
        profile_id: ownerId,
        type: 'subscription_expiring',
        title: daysLeft === 0 ? 'انتهى اشتراكك' : `⏰ باقي ${daysLeft} يوم على انتهاء اشتراكك`,
        body:
          daysLeft === 0
            ? 'تم إيقاف المميزات. جدّد الآن لاستعادة الشارة والإعلانات.'
            : `جدّد الآن عشان متخسرش المميزات (${daysLeft} يوم متبقي).`,
        deep_link: '/merchant/subscription',
      })

      // سجّل الحدث
      await supabase.from('subscription_events').insert({
        subscription_id: sub.id,
        business_id: sub.business_id,
        event_type: 'trial_expiring',
        metadata: { days_left: daysLeft, date: today },
      })

      notified++
    }

    // 2. أنهِ الاشتراكات المنتهية
    const { data: expiredCount } = await supabase.rpc('expire_old_subscriptions')

    return NextResponse.json({
      ok: true,
      notified,
      expired: expiredCount ?? 0,
      checked: expiring?.length ?? 0,
    })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
