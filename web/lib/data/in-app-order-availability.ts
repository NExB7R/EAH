import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'
import {
  isInAppOrderOperational,
  type InAppOrderBusinessCandidate,
} from './in-app-order-availability-core'

type ServiceClient = ReturnType<typeof createServiceClient>
type BusinessCandidate = InAppOrderBusinessCandidate

/**
 * Returns only activity IDs whose in-platform order workflow is currently usable.
 * WhatsApp is no longer required — it remains a contact-only channel.
 * All failures fail closed, so the UI never advertises an order workflow that cannot run.
 */
export async function getInAppOrderAvailableBusinessIds(
  supabase: ServiceClient,
  businesses: BusinessCandidate[],
  nowMs = Date.now(),
): Promise<Set<string>> {
  const candidates = businesses.filter(
    (business) =>
      typeof business.id === 'string' &&
      business.id.trim().length > 0 &&
      business.accepts_online_orders === true &&
      typeof business.owner_profile_id === 'string' &&
      business.owner_profile_id.trim().length > 0,
  )
  const ids = [...new Set(candidates.map((business) => business.id))]
  const available = new Set<string>()
  if (ids.length === 0) return available

  const settingsResult = await supabase
    .from('merchant_order_settings')
    .select(
      'business_id, orders_enabled, deadline_minutes, delivery_eta_minutes, offline_mode, offline_until, suspended_until',
    )
    .in('business_id', ids)

  if (settingsResult.error) {
    console.error('[in-app-order-availability] batch lookup failed', {
      settings: settingsResult.error?.message,
    })
    return available
  }

  const settingsByBusiness = new Map(
    (settingsResult.data ?? []).map((settings) => [settings.business_id, settings]),
  )

  for (const business of candidates) {
    const settings = settingsByBusiness.get(business.id)
    if (
      isInAppOrderOperational(
        business.accepts_online_orders,
        business.owner_profile_id,
        settings
          ? {
              orders_enabled: settings.orders_enabled,
              deadline_minutes: settings.deadline_minutes,
              delivery_eta_minutes: settings.delivery_eta_minutes,
              offline_mode: settings.offline_mode,
              offline_until: settings.offline_until,
              suspended_until: settings.suspended_until,
            }
          : null,
        nowMs,
      )
    ) {
      available.add(business.id)
    }
  }

  return available
}
