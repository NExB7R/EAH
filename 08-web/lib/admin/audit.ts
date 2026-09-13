import { createClient } from '@/lib/supabase-server'

type AuditAction =
  | 'business.create'
  | 'business.update'
  | 'business.delete'
  | 'business.toggle_featured'
  | 'business.toggle_published'
  | 'offer.create'
  | 'offer.update'
  | 'offer.delete'
  | 'review.approve'
  | 'review.reject'
  | 'review.hide'
  | 'review.delete'
  | 'user.ban'
  | 'user.unban'
  | 'user.role_change'
  | 'merchant.approve'
  | 'merchant.reject'

export async function auditLog({
  action,
  entityType,
  entityId,
  before,
  after,
  metadata,
}: {
  action: AuditAction
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}) {
  try {
    const supabase = await createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error } = await supabase.from('audit_logs').insert({
      actor_user_id: userData.user.id,
      action,
      entity_type: entityType,
      entity_id: entityId,
      before_data: before ?? null,
      after_data: after ?? null,
      metadata: metadata ?? {},
    })

    if (error) {
      console.error('[auditLog] insert failed:', error.message, { action, entityId })
    }
  } catch (err) {
    console.error('[auditLog] unexpected:', err)
  }
}
