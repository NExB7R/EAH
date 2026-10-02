import 'server-only'
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Push Notifications (Server)
// ═══════════════════════════════════════════════════════════

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:nexb7r@gmail.com'

let configured = false

function ensureConfigured() {
  if (configured) return true
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return false
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)
  configured = true
  return true
}

export type PushPayload = {
  title: string
  body: string
  url?: string
  tag?: string
  icon?: string
}

export type PushResult = {
  sent: number
  failed: number
  removed: number
}

// ─── أرسل push لمستخدم واحد ───
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<PushResult> {
  if (!ensureConfigured()) {
    return { sent: 0, failed: 0, removed: 0 }
  }

  const supabase = createServiceClient()
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return { sent: 0, failed: 0, removed: 0 }

  let sent = 0
  let failed = 0
  const toRemove: string[] = []

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        )
        sent += 1
      } catch (err) {
        failed += 1
        const status = (err as { statusCode?: number }).statusCode
        // 404 = subscription expired → احذف
        // 410 = gone → احذف
        if (status === 404 || status === 410) {
          toRemove.push(sub.id)
        }
      }
    }),
  )

  if (toRemove.length > 0) {
    await supabase.from('push_subscriptions').delete().in('id', toRemove)
  }

  return { sent, failed, removed: toRemove.length }
}

// ─── أرسل push لمجموعة مستخدمين ───
export async function sendPushToUsers(
  userIds: string[],
  payload: PushPayload,
): Promise<PushResult> {
  if (!ensureConfigured() || userIds.length === 0) {
    return { sent: 0, failed: 0, removed: 0 }
  }

  // دفع chunks لتجنّب timeouts
  const CHUNK = 50
  let sent = 0
  let failed = 0
  let removed = 0

  for (let i = 0; i < userIds.length; i += CHUNK) {
    const chunk = userIds.slice(i, i + CHUNK)
    const results = await Promise.all(chunk.map((uid) => sendPushToUser(uid, payload)))
    for (const r of results) {
      sent += r.sent
      failed += r.failed
      removed += r.removed
    }
  }

  return { sent, failed, removed }
}
