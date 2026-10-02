'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUserIdsForAudience, type AudienceType } from '@/lib/data/admin'
import { createBulkNotifications } from '@/lib/notifications/server'

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

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'غير مصرح' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
    return { ok: false as const, error: 'غير مصرح' }
  }
  return { ok: true as const, supabase, userId: user.id }
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
    actor_id: ctx.userId,
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
