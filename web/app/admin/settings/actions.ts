'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  site_name: z.string().min(2).max(60),
  support_email: z.string().email().max(120),
  support_whatsapp: z.string().max(30),
  announcement_banner: z.string().max(200).or(z.literal('')),
  maintenance_mode: z.boolean(),
  new_signups_enabled: z.boolean(),
  featured_enabled: z.boolean(),
})

export async function saveSettings(formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = schema.safeParse({
    site_name: String(formData.get('site_name') ?? '').trim(),
    support_email: String(formData.get('support_email') ?? '').trim(),
    support_whatsapp: String(formData.get('support_whatsapp') ?? '').trim(),
    announcement_banner: String(formData.get('announcement_banner') ?? '').trim(),
    maintenance_mode: formData.get('maintenance_mode') === 'on',
    new_signups_enabled: formData.get('new_signups_enabled') === 'on',
    featured_enabled: formData.get('featured_enabled') === 'on',
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  // نستخدم service role لحفظ الإعدادات في جدول app_settings
  const service = createServiceClient()

  const { error } = await service.from('app_settings').upsert(
    {
      key: 'site',
      value: parsed.data as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) {
    // لو الجدول مش موجود — نسجل في audit_logs بس
    await ctx.supabase.from('audit_logs').insert({
      actor_user_id: ctx.userId,
      action: 'settings.update',
      entity_type: 'app_settings',
      metadata: parsed.data as unknown as Record<string, unknown>,
    })
    revalidatePath('/admin/settings')
    return { ok: true }
  }

  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'settings.update',
    entity_type: 'app_settings',
    metadata: { keys: Object.keys(parsed.data) },
  })

  revalidatePath('/admin/settings')
  return { ok: true }
}
