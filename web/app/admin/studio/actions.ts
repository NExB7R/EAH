'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { DEFAULT_FLAGS, type FeatureFlags } from '@/lib/features'

type Result = { ok: true } | { ok: false; error: string }

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
      updated_by: ctx.userId,
    },
    { onConflict: 'key' },
  )

  if (error) return { ok: false, error: error.message }

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
