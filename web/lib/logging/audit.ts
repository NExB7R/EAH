import type { SupabaseClient } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════
// EAH — Audit Log Helper (Admin actions)
// ═══════════════════════════════════════════════════════════

type AuditInput = {
  actorUserId: string
  action: string
  entityType: string
  entityId?: string | null
  metadata?: Record<string, unknown>
  beforeData?: Record<string, unknown> | null
  afterData?: Record<string, unknown> | null
}

export async function logAudit(supabase: SupabaseClient, input: AuditInput): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      actor_user_id: input.actorUserId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      metadata: input.metadata ?? {},
      before_data: input.beforeData ?? null,
      after_data: input.afterData ?? null,
    })
  } catch {
    // فشل التسجيل مينفعش يكسر العملية
  }
}
