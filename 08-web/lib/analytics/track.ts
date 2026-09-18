import { createClient } from '@/lib/supabase-server'

export type EventScope =
  | 'business_view'
  | 'business_reveal'
  | 'order_start'
  | 'order_confirm'
  | 'cta_click'
  | 'search_query'

type TrackParams = {
  scope: EventScope
  businessId?: string | null
  visitorId?: string | null
  sessionId?: string | null
  referrer?: string | null
  deviceType?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Server-side event tracker.
 * بيستخدم page_view_events مع event_scope مختلف.
 * Silent failure — ميفشلش الطلب الأصلي.
 */
export async function trackEvent(params: TrackParams): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.from('page_view_events').insert({
      business_id: params.businessId ?? null,
      path: params.metadata?.path ?? null,
      visitor_id: params.visitorId ?? null,
      session_id: params.sessionId ?? null,
      referrer: params.referrer ?? null,
      device_type: params.deviceType ?? null,
      event_scope: params.scope,
    })
  } catch { /* silent — never block main flow */ }
}
