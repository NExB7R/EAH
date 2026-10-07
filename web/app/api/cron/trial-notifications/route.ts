import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createNotification } from '@/lib/notifications/server'
import { logError, captureException } from '@/lib/logging/errors'

// ═══════════════════════════════════════════════════════════
// EAH — Cron: Trial Notifications (يومي)
//   • أيام 7 / 15 / 25 / 28 / 30 من التجربة
//   • notified_days[] يمنع التكرار
//   • يوم 15 = رسالة "بوست FB + سكرين" (بطلب المالك)
// ═══════════════════════════════════════════════════════════

type Milestone = {
  day: number
  title: string
  body: string
  deepLink: string
}

const MILESTONES: Milestone[] = [
  {
    day: 7,
    title: '🎯 تجربتك شغّالة تمام',
    body: 'شوف إحصائياتك في لوحة التحكم — عارف عملاءك جايين منين؟',
    deepLink: '/merchant',
  },
  {
    day: 15,
    title: '🎁 فاضلك 15 يوم — عايز تكمّل؟',
    body: 'اعمل بوست على صفحتك + تقييم على صفحتنا، وابعت السكرين على واتساب لتمديد التجربة.',
    deepLink: '/merchant/subscription',
  },
  {
    day: 25,
    title: '⏰ فاضلك 5 أيام بس',
    body: 'باقي 5 أيام في تجربتك المجانية. اختار باقتك واستمر بدون انقطاع.',
    deepLink: '/merchant/subscription',
  },
  {
    day: 28,
    title: '⏳ يومين وتنتهي التجربة',
    body: 'اشترك دلوقتي — عرض مميز بيستنى. لو محتاج نساعدك، كلمنا على واتساب.',
    deepLink: '/merchant/subscription',
  },
  {
    day: 30,
    title: '🔔 آخر يوم في تجربتك',
    body: 'آخر يوم — بعدها هترجع للباقة الأساسية. اشترك دلوقتي وحافظ على كل المزايا.',
    deepLink: '/merchant/subscription',
  },
]

type TrialSub = {
  id: string
  business_id: string
  expires_at: string
  starts_at: string | null
  notified_days: number[] | null
  business: { name: string; owner_profile_id: string | null } | null
}

function daysElapsed(startsAt: string | null, now: Date, fallback: number): number {
  if (!startsAt) return fallback
  const start = new Date(startsAt).getTime()
  return Math.floor((now.getTime() - start) / (24 * 60 * 60 * 1000))
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const now = new Date()

    const { data: subs, error } = await supabase
      .from('business_subscriptions')
      .select(
        `
        id, business_id, starts_at, expires_at, notified_days,
        business:businesses(name, owner_profile_id)
      `,
      )
      .eq('status', 'trial')
      .eq('is_trial', true)
      .gt('expires_at', now.toISOString())

    if (error) {
      await logError({
        severity: 'medium',
        source: 'cron',
        message: `trial-notifications fetch failed: ${error.message}`,
        path: '/api/cron/trial-notifications',
      })
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    const rows = (subs ?? []) as unknown as TrialSub[]

    let sent = 0
    const summary: { sub: string; day: number }[] = []

    for (const sub of rows) {
      const ownerId = sub.business?.owner_profile_id
      const bizName = sub.business?.name ?? 'نشاطك'
      if (!ownerId) continue

      // حساب الأيام المنقضية — من starts_at أو من expires_at كـ fallback
      const elapsed = sub.starts_at
        ? daysElapsed(sub.starts_at, now, 0)
        : Math.max(
            0,
            30 -
              Math.ceil(
                (new Date(sub.expires_at).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
              ),
          )

      const already = sub.notified_days ?? []

      // اعرض أعلى milestone لسه مبعوتش (لو فات أيام كتير)
      const milestone = MILESTONES.slice()
        .reverse()
        .find((m) => elapsed >= m.day && !already.includes(m.day))

      if (!milestone) continue

      await createNotification({
        userId: ownerId,
        type: 'admin',
        title: milestone.title,
        body: milestone.body.replace('تجربتك', `تجربة "${bizName}"`),
        deepLink: milestone.deepLink,
      })

      const nextNotified = [...already, milestone.day]

      await supabase
        .from('business_subscriptions')
        .update({ notified_days: nextNotified })
        .eq('id', sub.id)

      sent++
      summary.push({ sub: sub.id, day: milestone.day })
    }

    return NextResponse.json({
      ok: true,
      checked: rows.length,
      sent,
      summary,
    })
  } catch (err) {
    await captureException(err, {
      severity: 'high',
      source: 'cron',
      path: '/api/cron/trial-notifications',
    })
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
