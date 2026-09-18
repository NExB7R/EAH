import { createClient } from '@/lib/supabase-server'

export type PendingAction =
  | 'business.update'
  | 'business.delete'
  | 'business.images_change'
  | 'review.hide'
  | 'review.delete'
  | 'offer.update'
  | 'offer.delete'
  | 'profile.update'

export async function submitPendingChange(params: {
  action: PendingAction
  entityType: string
  entityId: string | null
  payload: Record<string, unknown>
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('submit_pending_change', {
    p_action: params.action,
    p_entity_type: params.entityType,
    p_entity_id: params.entityId,
    p_payload: params.payload,
  })
  if (error) return { ok: false, error: error.message }
  const r = data as any
  return r?.ok ? { ok: true, id: r.id } : { ok: false, error: r?.reason ?? 'failed' }
}

export async function approvePendingChange(id: string, note?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('approve_pending_change', {
    p_id: id,
    p_note: note ?? null,
  })
  if (error) return { ok: false, error: error.message }
  return data as { ok: boolean; reason?: string }
}

export async function rejectPendingChange(id: string, note?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('reject_pending_change', {
    p_id: id,
    p_note: note ?? null,
  })
  if (error) return { ok: false, error: error.message }
  return data as { ok: boolean; reason?: string }
}
