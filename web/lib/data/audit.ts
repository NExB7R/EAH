import { createClient } from '@/lib/supabase/server'

export type AuditEvent = {
  id: string
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export async function getUserAuditEvents(limit = 30): Promise<AuditEvent[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, action, entity_type, entity_id, metadata, created_at')
    .eq('actor_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return []
  return (data ?? []) as AuditEvent[]
}
