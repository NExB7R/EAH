import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'

type SubscriptionRow = {
  business_id: string
  status: string
  is_trial: boolean
  starts_at: string | null
  expires_at: string | null
  plan: {
    price_egp: number | string | null
    features: unknown
    is_active: boolean
  } | null
}

/**
 * Homepage Featured is a paid placement, not the same thing as a generic
 * "Featured" badge. Only a live, non-trial, paid plan that explicitly grants
 * the featured_home feature is eligible. Admins still choose which eligible
 * activities receive the slot through businesses.is_featured.
 */
export async function getPaidFeaturedHomeBusinessIds(
  businessIds?: readonly string[],
): Promise<Set<string>> {
  if (businessIds && businessIds.length === 0) return new Set()

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch {
    return new Set()
  }

  const now = new Date().toISOString()
  let query = supabase
    .from('business_subscriptions')
    .select(
      'business_id, status, is_trial, starts_at, expires_at, plan:subscription_plans!inner(price_egp, features, is_active)',
    )
    .eq('status', 'active')
    .eq('is_trial', false)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(5000)

  if (businessIds) query = query.in('business_id', [...businessIds])

  const { data, error } = await query
  if (error) {
    console.error('[featured-eligibility] subscription lookup failed:', error.message)
    return new Set()
  }

  const rows = (data ?? []) as unknown as SubscriptionRow[]
  const eligible = new Set<string>()

  for (const row of rows) {
    const plan = row.plan
    const features = Array.isArray(plan?.features) ? plan.features : []
    const price = Number(plan?.price_egp ?? 0)

    if (
      row.status === 'active' &&
      !row.is_trial &&
      plan?.is_active === true &&
      Number.isFinite(price) &&
      price > 0 &&
      features.includes('featured_home')
    ) {
      eligible.add(row.business_id)
    }
  }

  return eligible
}

export async function hasPaidFeaturedHomeSubscription(businessId: string): Promise<boolean> {
  const eligible = await getPaidFeaturedHomeBusinessIds([businessId])
  return eligible.has(businessId)
}
