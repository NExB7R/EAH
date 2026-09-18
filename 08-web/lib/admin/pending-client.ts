'use client'

export async function submitPendingAndNotify(params: {
  action: string
  entityType: string
  entityId: string | null
  payload: Record<string, unknown>
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch('/api/admin/pending/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      payload: params.payload,
    }),
  })
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.ok) {
    return { ok: false, error: json?.error ?? 'failed' }
  }
  return { ok: true, id: json.id }
}
