export type PaidPlanFeature = 'featured_badge' | 'featured_home'

export type SubscriptionEntitlementSnapshot = {
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

/** Pure eligibility rule shared by public placement and admin controls. */
export function hasActivePaidPlanFeature(
  subscription: SubscriptionEntitlementSnapshot,
  feature: PaidPlanFeature,
  nowMs = Date.now(),
): boolean {
  const plan = subscription.plan
  const features = Array.isArray(plan?.features) ? plan.features : []
  const price = Number(plan?.price_egp ?? 0)
  const startsAt = subscription.starts_at ? new Date(subscription.starts_at).getTime() : null
  const expiresAt = subscription.expires_at ? new Date(subscription.expires_at).getTime() : null
  const hasStarted =
    startsAt === null || (Number.isFinite(startsAt) && startsAt <= nowMs)
  const hasNotExpired =
    expiresAt === null || (Number.isFinite(expiresAt) && expiresAt > nowMs)

  return (
    subscription.status === 'active' &&
    !subscription.is_trial &&
    plan?.is_active === true &&
    Number.isFinite(price) &&
    price > 0 &&
    hasStarted &&
    hasNotExpired &&
    features.includes(feature)
  )
}
