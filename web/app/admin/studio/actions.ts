'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FLAGS, type FeatureFlags } from '@/lib/features'
import { DEFAULT_TEXTS, type AppTexts } from '@/lib/app-texts'
import { requireAdmin } from '@/lib/auth/admin'

type Result = { ok: true } | { ok: false; error: string }

export async function saveFeatureFlags(flags: FeatureFlags): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const safe: FeatureFlags = { ...DEFAULT_FLAGS }
  for (const key of Object.keys(DEFAULT_FLAGS) as (keyof FeatureFlags)[]) {
    safe[key] = !!flags[key]
  }

  const service = createServiceClient()
  const { error } = await service.from('app_settings').upsert(
    {
      key: 'features',
      value: safe as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'features.update',
    entity_type: 'app_settings',
    metadata: safe as unknown as Record<string, unknown>,
  })

  updateTag('features')
  revalidatePath('/admin/studio')
  revalidatePath('/')
  return { ok: true }
}

export async function saveAppTexts(texts: AppTexts): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const safe: AppTexts = { ...DEFAULT_TEXTS }
  for (const key of Object.keys(DEFAULT_TEXTS) as (keyof AppTexts)[]) {
    const v = texts[key]
    if (typeof v === 'string') safe[key] = v.trim().slice(0, 200) || DEFAULT_TEXTS[key]
  }

  const service = createServiceClient()
  const { error } = await service.from('app_settings').upsert(
    {
      key: 'texts',
      value: safe as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'key' },
  )

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'texts.update',
    entity_type: 'app_settings',
    metadata: safe as unknown as Record<string, unknown>,
  })

  updateTag('app-texts')
  revalidatePath('/admin/studio')
  revalidatePath('/')
  return { ok: true }
}
