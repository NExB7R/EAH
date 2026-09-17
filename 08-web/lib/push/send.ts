import { createServiceClient } from '@/lib/supabase-server'
import { getWebPush } from './vapid'

export type PushPayload = {
  title: string
  body: string
  url?: string
}

type QuietHours = { enabled: boolean; from: string; to: string }

/** هل الوقت الحالي داخل ساعات الهدوء؟ */
function inQuietHours(q: QuietHours | null | undefined): boolean {
  if (!q?.enabled) return false
  try {
    const [fh, fm] = q.from.split(':').map(Number)
    const [th, tm] = q.to.split(':').map(Number)
    const now = new Date()
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const fromMin = fh * 60 + fm
    const toMin = th * 60 + tm

    // فترة عادية (مثلاً 22:00 → 08:00 = فترة ليلية تعبر منتصف الليل)
    if (fromMin > toMin) {
      return nowMin >= fromMin || nowMin < toMin
    }
    return nowMin >= fromMin && nowMin < toMin
  } catch {
    return false
  }
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const supabase = createServiceClient()

    // فحص تفضيلات المستخدم + ساعات الهدوء
    const { data: profile } = await supabase
      .from('profiles')
      .select('notif_prefs, notif_quiet_hours')
      .eq('id', userId)
      .maybeSingle()

    const quiet = (profile?.notif_quiet_hours as QuietHours | null) ?? null
    if (inQuietHours(quiet)) {
      // سجّلها للـ inbox لكن ما تبعتش push
      return { sent: 0, quiet: true }
    }

    const prefs = (profile?.notif_prefs as Record<string, boolean> | null) ?? {}
    const prefKey = (payload as any).type as string | undefined
    if (prefKey && prefs[prefKey] === false) {
      return { sent: 0, blocked: true }
    }

    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('id,endpoint,p256dh,auth')
      .eq('user_id', userId)

    if (!subs || subs.length === 0) return { sent: 0 }

    const wp = getWebPush()
    let sent = 0

    for (const s of subs) {
      try {
        await wp.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        )
        sent++
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          await supabase.from('push_subscriptions').delete().eq('id', s.id)
        }
      }
    }

    return { sent }
  } catch {
    return { sent: 0 }
  }
}
