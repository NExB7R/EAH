import 'server-only'

import { createServiceClient } from '@/lib/supabase/service'
import { hasActivePaidPlanFeature } from '@/lib/plan-entitlements'

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

export type PaidFeatureEntitlement = {
  expiresAt: string | null
}

/**
 * Returns a paid entitlement and its actual subscription expiry.
 * A null expiry means the paid plan has no fixed end date.
 */
export async function getPaidBusinessFeatureEntitlements(
  feature: 'featured_badge' | 'featured_home',
  businessIds?: readonly string[],
): Promise<Map<string, PaidFeatureEntitlement>> {
  if (businessIds && businessIds.length === 0) return new Map()

  let supabase: ReturnType<typeof createServiceClient>
  try {
    supabase = createServiceClient()
  } catch {
    return new Map()
  }

  let query = supabase
    .from('business_subscriptions')
    .select(
      'business_id, status, is_trial, starts_at, expires_at, plan:subscription_plans!inner(price_egp, features, is_active)',
    )
    .eq('status', 'active')
    .eq('is_trial', false)
    .limit(5000)

  if (businessIds) query = query.in('business_id', [...businessIds])

  const { data, error } = await query
  if (error) {
    console.error('[featured-eligibility] subscription lookup failed:', error.message)
    return new Map()
  }

  const rows = (data ?? []) as unknown as SubscriptionRow[]
  const eligible = new Map<string, PaidFeatureEntitlement>()

  for (const row of rows) {
    if (!hasActivePaidPlanFeature(row, feature)) continue

    const existing = eligible.get(row.business_id)
    if (!existing) {
      eligible.set(row.business_id, { expiresAt: row.expires_at })
      continue
    }

    // Any open-ended qualifying paid plan is sufficient for open-ended access.
    if (existing.expiresAt === null) continue
    if (row.expires_at === null) {
      eligible.set(row.business_id, { expiresAt: null })
      continue
    }

    if (new Date(row.expires_at).getTime() > new Date(existing.expiresAt).getTime()) {
      eligible.set(row.business_id, { expiresAt: row.expires_at })
    }
  }

  return eligible
}

export async function getPaidBusinessIdsWithFeature(
  feature: 'featured_badge' | 'featured_home',
  businessIds?: readonly string[],
): Promise<Set<string>> {
  const entitlements = await getPaidBusinessFeatureEntitlements(feature, businessIds)
  return new Set(entitlements.keys())
}

export async function getPaidFeaturedHomeBusinessIds(
  businessIds?: readonly string[],
): Promise<Set<string>> {
  return getPaidBusinessIdsWithFeature('featured_home', businessIds)
}

export async function getPaidFeaturedHomeEntitlements(
  businessIds?: readonly string[],
): Promise<Map<string, PaidFeatureEntitlement>> {
  return getPaidBusinessFeatureEntitlements('featured_home', businessIds)
}

export async function hasPaidFeaturedHomeSubscription(businessId: string): Promise<boolean> {
  const eligible = await getPaidFeaturedHomeBusinessIds([businessId])
  return eligible.has(businessId)
}
