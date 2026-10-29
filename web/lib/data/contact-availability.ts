import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'
import { hasUsableWhatsAppDestination } from './contact-availability-utils'

type ServiceClient = ReturnType<typeof createServiceClient>


/**
 * Return only the business IDs with at least one usable WhatsApp destination.
 * Branch contact values are checked in the service layer and never returned to
 * any public payload. A lookup error fails closed for that source.
 */
export async function getWhatsAppDestinationBusinessIds(
  supabase: ServiceClient,
  businessIds: string[],
): Promise<Set<string>> {
  const ids = [...new Set(businessIds.filter((id) => id.trim().length > 0))]
  const available = new Set<string>()
  if (ids.length === 0) return available

  const [branchesResult, contactsResult] = await Promise.all([
    supabase
      .from('business_branches')
      .select('business_id, whatsapp')
      .in('business_id', ids)
      .eq('is_active', true),
    supabase
      .from('business_contact_methods')
      .select('business_id, value')
      .in('business_id', ids)
      .eq('method_type', 'whatsapp')
      .eq('is_public', true),
  ])

  if (branchesResult.error) {
    console.error('[contact-availability] active branch lookup failed:', branchesResult.error.message)
  } else {
    for (const row of branchesResult.data ?? []) {
      if (hasUsableWhatsAppDestination(row.whatsapp)) available.add(row.business_id)
    }
  }

  if (contactsResult.error) {
    console.error('[contact-availability] public contact lookup failed:', contactsResult.error.message)
  } else {
    for (const row of contactsResult.data ?? []) {
      if (hasUsableWhatsAppDestination(row.value)) available.add(row.business_id)
    }
  }

  return available
}
