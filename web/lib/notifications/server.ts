import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPushToUser, sendPushToUsers, type PushPayload } from '@/lib/push/server'

// ═══════════════════════════════════════════════════════════
// EAH — Notifications (Server helper موحّد)
// كل إشعار = DB row + Push (لو مفعّل)
// ═══════════════════════════════════════════════════════════

export type NotificationType =
  | 'system'
  | 'admin'
  | 'review'
  | 'review_reply'
  | 'order_new'
  | 'order_status'
  | 'offer_new'
  | 'follow_new'
  | 'subscription'
  | 'announcement'

export type CreateNotificationInput = {
  userId: string
  type: NotificationType
  title: string
  body: string
  deepLink?: string
  push?: boolean
  pushTag?: string
}

export type CreateBulkInput = {
  userIds: string[]
  type: NotificationType
  title: string
  body: string
  deepLink?: string
  push?: boolean
  pushTag?: string
}

// ─── إشعار واحد ───
export async function createNotification(input: CreateNotificationInput): Promise<{ ok: boolean }> {
  const supabase = createServiceClient()

  const { error } = await supabase.from('notifications').insert({
    user_id: input.userId,
    notification_type: input.type,
    title: input.title,
    body: input.body,
    deep_link: input.deepLink ?? null,
  })

  if (error) return { ok: false }

  if (input.push !== false) {
    const payload: PushPayload = {
      title: input.title,
      body: input.body,
      url: input.deepLink ?? '/',
      tag: input.pushTag ?? input.type,
    }
    void sendPushToUser(input.userId, payload).catch(() => {})
  }

  return { ok: true }
}

// ─── bulk (لفئة معينة) ───
export async function createBulkNotifications(
  input: CreateBulkInput,
): Promise<{ inserted: number; pushed: number }> {
  if (input.userIds.length === 0) return { inserted: 0, pushed: 0 }

  const supabase = createServiceClient()

  const rows = input.userIds.map((uid) => ({
    user_id: uid,
    notification_type: input.type,
    title: input.title,
    body: input.body,
    deep_link: input.deepLink ?? null,
  }))

  // chunks 500 (Supabase limit)
  let inserted = 0
  const CHUNK = 500
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK)
    const { error } = await supabase.from('notifications').insert(slice)
    if (!error) inserted += slice.length
  }

  let pushed = 0
  if (input.push !== false) {
    const payload: PushPayload = {
      title: input.title,
      body: input.body,
      url: input.deepLink ?? '/',
      tag: input.pushTag ?? input.type,
    }
    const res = await sendPushToUsers(input.userIds, payload)
    pushed = res.sent
  }

  return { inserted, pushed }
}
