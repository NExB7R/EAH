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

// ─── أنواع "مقفلة" (مش قابلة للإطفاء) ───
const LOCKED_TYPES: Set<NotificationType> = new Set(['system', 'admin', 'announcement'])

// ─── فحص تفضيلات المستخدم ───
async function isTypeEnabled(userId: string, type: NotificationType): Promise<boolean> {
  if (LOCKED_TYPES.has(type)) return true

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('notif_prefs')
    .eq('id', userId)
    .maybeSingle()

  const prefs = (data?.notif_prefs as Record<string, boolean> | null) ?? null

  // مفيش تفضيلات محفوظة → كل حاجة مفعّلة
  if (!prefs) return true

  // لو المفتاح مش موجود → default true
  return prefs[type] !== false
}

// ─── إشعار واحد ───
export async function createNotification(input: CreateNotificationInput): Promise<{ ok: boolean }> {
  // 1) فحص تفضيلات المستخدم
  const enabled = await isTypeEnabled(input.userId, input.type)
  if (!enabled) return { ok: true } // متجاهَل بصمت

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

  // فلترة حسب تفضيلات كل مستخدم (Locked types مش محتاجة فحص)
  let targetIds = input.userIds
  if (!LOCKED_TYPES.has(input.type)) {
    const { data: prefsData } = await supabase
      .from('profiles')
      .select('id, notif_prefs')
      .in('id', input.userIds)

    const disabled = new Set<string>()
    for (const row of prefsData ?? []) {
      const prefs = (row.notif_prefs as Record<string, boolean> | null) ?? null
      if (prefs && prefs[input.type] === false) {
        disabled.add(row.id as string)
      }
    }
    targetIds = input.userIds.filter((id) => !disabled.has(id))
  }

  if (targetIds.length === 0) return { inserted: 0, pushed: 0 }

  const rows = targetIds.map((uid) => ({
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
