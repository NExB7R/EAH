import { createServiceClient } from '@/lib/supabase-server'
import { getWebPush } from './vapid'

export type PushPayload = {
  title: string
  body: string
  url?: string
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const supabase = createServiceClient()
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
          JSON.stringify(payload)
        )
        sent++
      } catch (err: any) {
        // لو الـ subscription منتهي
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
