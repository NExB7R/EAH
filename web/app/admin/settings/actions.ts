'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

type Result = { ok: true } | { ok: false; error: string }

const schema = z
  .object({
    site_name: z.string().trim().min(2).max(60),
    support_email: z.string().trim().max(120).refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'إيميل الدعم غير صحيح'),
    support_whatsapp: z.string().trim().max(30).refine((v) => !v || /^\+?[0-9\s()\-]{8,25}$/.test(v), 'رقم واتساب الدعم غير صحيح'),
    support_facebook_url: z.string().trim().max(300).refine((v) => !v || isHttpsHost(v, ['facebook.com', 'fb.com']), 'رابط فيسبوك لازم يكون HTTPS وعلى نطاق فيسبوك'),
    whatsapp_channel_url: z.string().trim().max(300).refine((v) => !v || isHttpsHost(v, ['whatsapp.com']), 'رابط قناة واتساب لازم يكون HTTPS وعلى نطاق واتساب'),
    public_contacts_enabled: z.boolean(),
    announcement_banner: z.string().max(200).or(z.literal('')),
    maintenance_mode: z.boolean(),
    new_signups_enabled: z.boolean(),
    featured_enabled: z.boolean(),
  })
  .superRefine((value, context) => {
    if (
      value.public_contacts_enabled &&
      !value.support_email &&
      !value.support_whatsapp &&
      !value.support_facebook_url &&
      !value.whatsapp_channel_url
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['public_contacts_enabled'],
        message: 'أضف قناة تواصل رسمية واحدة على الأقل قبل إظهارها للزوار',
      })
    }
  })

function isHttpsHost(value: string, hosts: string[]): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && hosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  } catch {
    return false
  }
}

export async function saveSettings(formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = schema.safeParse({
    site_name: String(formData.get('site_name') ?? '').trim(),
    support_email: String(formData.get('support_email') ?? '').trim(),
    support_whatsapp: String(formData.get('support_whatsapp') ?? '').trim(),
    support_facebook_url: String(formData.get('support_facebook_url') ?? '').trim(),
    whatsapp_channel_url: String(formData.get('whatsapp_channel_url') ?? '').trim(),
    public_contacts_enabled: formData.get('public_contacts_enabled') === 'on',
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
    console.error('[admin-settings] failed to save settings:', error.message)
    await service.from('audit_logs').insert({
      actor_user_id: ctx.userId,
      action: 'settings.update_failed',
      entity_type: 'app_settings',
      metadata: { keys: Object.keys(parsed.data), error: 'storage_write_failed' },
    })
    return { ok: false, error: 'تعذر حفظ الإعدادات. لم تتغير القنوات المعروضة للزوار.' }
  }

  await service.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'settings.update',
    entity_type: 'app_settings',
    metadata: { keys: Object.keys(parsed.data) },
  })

  revalidateTag('site-settings', 'default')
  revalidatePath('/admin/settings')
  revalidatePath('/contact')
  revalidatePath('/')
  revalidatePath('/merchant/subscription')
  return { ok: true }
}
