'use client'

type AuditAction =
  | 'review.reply'
  | 'offer.create'
  | 'offer.update'
  | 'offer.delete'
  | 'menu.item_create'
  | 'menu.item_update'
  | 'menu.item_delete'

export async function auditClient(params: {
  action: AuditAction
  entityType: string
  entityId: string
  before?: unknown
  after?: unknown
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await fetch('/api/audit/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      keepalive: true,
    })
  } catch {
    /* silent */
  }
}
