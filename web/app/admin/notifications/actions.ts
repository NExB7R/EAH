'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getUserIdsForAudience, type AudienceType } from '@/lib/data/admin'
import { createBulkNotifications } from '@/lib/notifications/server'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Notifications Actions
// ═══════════════════════════════════════════════════════════

const schema = z.object({
  title: z.string().min(2).max(80),
  body: z.string().min(2).max(400),
  deepLink: z.string().max(300).optional().or(z.literal('')),
  audience: z.enum(['all', 'customers', 'merchants', 'verified', 'premium']),
  push: z.boolean().default(true),
})

export type SendResult =
  | {
      ok: true
      inserted: number
      pushed: number
      audience: AudienceType
    }
  | {
      ok: false
      error: string
    }

export async function markOwnNotificationRead(notificationId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsedId = z.string().uuid().safeParse(notificationId)
  if (!parsedId.success) return { ok: false, error: 'معرّف الإشعار غير صالح' }

  let privileged: ReturnType<typeof createServiceClient>
  try {
    privileged = createServiceClient()
  } catch {
    return { ok: false, error: 'تعذر تحديث الإشعار مؤقتًا — حاول تاني' }
  }

  const { data: updated, error } = await privileged
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', parsedId.data)
    .eq('user_id', ctx.userId)
    .is('read_at', null)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر تحديث الإشعار — حاول تاني' }

  if (!updated) {
    const { data: existing, error: lookupError } = await privileged
      .from('notifications')
      .select('id, read_at')
      .eq('id', parsedId.data)
      .eq('user_id', ctx.userId)
      .maybeSingle()

    if (lookupError) return { ok: false, error: 'تعذر التحقق من حالة الإشعار' }
    if (!existing) return { ok: false, error: 'الإشعار غير موجود' }
    if (!existing.read_at) return { ok: false, error: 'تعذر حفظ حالة القراءة — حاول تاني' }
  }

  revalidatePath('/admin/notifications')
  revalidatePath('/admin')
  return { ok: true }
}

export async function sendBroadcast(formData: FormData): Promise<SendResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const raw = {
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? '').trim(),
    deepLink: String(formData.get('deepLink') ?? '').trim(),
    audience: String(formData.get('audience') ?? 'all'),
    push: formData.get('push') === 'on',
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: 'بيانات غير صحيحة' }
  }

  const userIds = await getUserIdsForAudience(parsed.data.audience)
  if (userIds.length === 0) {
    return { ok: false, error: 'مفيش مستخدمين في الفئة دي' }
  }

  const res = await createBulkNotifications({
    userIds,
    type: 'announcement',
    title: parsed.data.title,
    body: parsed.data.body,
    deepLink: parsed.data.deepLink || undefined,
    push: parsed.data.push,
    pushTag: 'admin-broadcast',
  })

  // audit log
  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'notifications.broadcast',
    entity_type: 'notifications',
    entity_id: null,
    metadata: {
      audience: parsed.data.audience,
      title: parsed.data.title,
      inserted: res.inserted,
      pushed: res.pushed,
      total_target: userIds.length,
    },
  })

  revalidatePath('/admin/notifications')

  return {
    ok: true,
    inserted: res.inserted,
    pushed: res.pushed,
    audience: parsed.data.audience,
  }
}
