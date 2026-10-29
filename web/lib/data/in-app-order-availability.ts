import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'
import {
  hasUsableWhatsAppDestination,
} from './contact-availability-utils'
import { isInAppOrderOperational } from './in-app-order-availability-core'

type ServiceClient = ReturnType<typeof createServiceClient>
type BusinessCandidate = {
  id: string
  accepts_orders: unknown
  owner_profile_id: unknown
}

/**
 * Returns only activity IDs whose in-platform order workflow is currently usable.
 * Related settings and WhatsApp destinations are loaded in batches; all failures
 * fail closed, so the UI never advertises an order workflow that cannot run.
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
      business.accepts_orders === true &&
      typeof business.owner_profile_id === 'string' &&
      business.owner_profile_id.trim().length > 0,
  )
  const ids = [...new Set(candidates.map((business) => business.id))]
  const available = new Set<string>()
  if (ids.length === 0) return available

  const [settingsResult, branchesResult, contactsResult] = await Promise.all([
    supabase
      .from('merchant_order_settings')
      .select(
        'business_id, orders_enabled, deadline_minutes, delivery_eta_minutes, offline_mode, offline_until, suspended_until',
      )
      .in('business_id', ids),
    supabase
      .from('business_branches')
      .select('business_id, whatsapp')
      .in('business_id', ids)
      .eq('is_active', true),
    supabase
      .from('business_contact_methods')
      .select('business_id, method_type, value')
      .in('business_id', ids)
      .eq('method_type', 'whatsapp'),
  ])

  if (settingsResult.error || branchesResult.error || contactsResult.error) {
    console.error('[in-app-order-availability] batch lookup failed', {
      settings: settingsResult.error?.message,
      branches: branchesResult.error?.message,
      contacts: contactsResult.error?.message,
    })
    return available
  }

  const settingsByBusiness = new Map(
    (settingsResult.data ?? []).map((settings) => [settings.business_id, settings]),
  )
  const whatsappBusinessIds = new Set<string>()

  for (const branch of branchesResult.data ?? []) {
    if (hasUsableWhatsAppDestination(branch.whatsapp)) {
      whatsappBusinessIds.add(branch.business_id)
    }
  }

  for (const contact of contactsResult.data ?? []) {
    if (hasUsableWhatsAppDestination(contact.value)) {
      whatsappBusinessIds.add(contact.business_id)
    }
  }

  for (const business of candidates) {
    const settings = settingsByBusiness.get(business.id)
    if (
      isInAppOrderOperational(
        business.accepts_orders,
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
        whatsappBusinessIds.has(business.id),
        nowMs,
      )
    ) {
      available.add(business.id)
    }
  }

  return available
}
