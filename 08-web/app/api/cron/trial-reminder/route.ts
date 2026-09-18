import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { sendPushToUser } from '@/lib/push/send'
import { IcDiamond } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()
  const in7days = new Date(now.getTime() + 7 * 86400_000)

  const { data: subs, error } = await supabase
    .from('business_subscriptions')
    .select('id,business_id,expires_at,is_trial,status')
    .in('status', ['trial', 'active'])
    .gte('expires_at', now.toISOString())
    .lte('expires_at', in7days.toISOString())

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  if (!subs || subs.length === 0) return NextResponse.json({ ok: true, sent: 0 })

  const businessIds = subs.map((s) => s.business_id)
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id,name,slug,owner_profile_id')
    .in('id', businessIds)

  const byId = new Map((businesses ?? []).map((b) => [b.id, b]))

  let sent = 0
  for (const s of subs) {
    const biz = byId.get(s.business_id)
    if (!biz?.owner_profile_id) continue

    const left = Math.floor((new Date(s.expires_at).getTime() - now.getTime()) / 86400_000)
    const isTrial = s.is_trial

    const title = isTrial ? '⏰ تجربتك قربت تخلص' : 'باقتك هتخلص قريب'
    const body = isTrial
      ? `فاضل ${left} يوم — اختار باقتك وكمّل على EAH`
      : `فاضل ${left} يوم — جدّد باقتك وكمّل من غير انقطاع`

    const deepLink = `/merchant/subscription`

    await supabase.from('notifications').insert({
      profile_id: biz.owner_profile_id,
      type: isTrial ? 'trial_ending' : 'subscription_ending',
      title,
      body,
      deep_link: deepLink,
    })

    try {
      await sendPushToUser(biz.owner_profile_id, { type: 'merchant_subscription', title, body, url: deepLink })
      sent++
    } catch { /* silent */ }
  }

  return NextResponse.json({ ok: true, sent, subs: subs.length })
}
