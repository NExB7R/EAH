import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'

const ALLOWED_ACTIONS = new Set([
  'profile.name_update',
  'profile.avatar_upload',
  'profile.avatar_delete',
])

type Input = {
  userId: string
  action: string
  entityType?: string
  entityId?: string
  metadata?: Record<string, unknown>
}

export async function logUserEvent(input: Input): Promise<void> {
  if (!ALLOWED_ACTIONS.has(input.action)) return
  try {
    const supabase = createServiceClient()
    await supabase.from('audit_logs').insert({
      actor_user_id: input.userId,
      action: input.action,
      entity_type: input.entityType ?? 'user',
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
    })
  } catch {
    // لا نكسر العملية لو التسجيل فشل
  }
}
