'use client'

export type ClientEventScope =
  | 'order_start'
  | 'cta_click'
  | 'search_query'

export function trackClientEvent(
  scope: ClientEventScope,
  params: { businessId?: string | null; metadata?: Record<string, unknown> } = {}
) {
  if (typeof window === 'undefined') return
  try {
    const body = JSON.stringify({
      scope,
      businessId: params.businessId ?? null,
      metadata: params.metadata,
    })
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  } catch { /* silent */ }
}
