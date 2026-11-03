import { describe, expect, it } from 'vitest'
import { hasActivePaidPlanFeature, type SubscriptionEntitlementSnapshot } from './plan-entitlements'

const NOW = Date.parse('2026-11-03T12:00:00.000Z')

function subscription(
  overrides: Partial<SubscriptionEntitlementSnapshot> = {},
): SubscriptionEntitlementSnapshot {
  return {
    status: 'active',
    is_trial: false,
    starts_at: '2026-11-01T00:00:00.000Z',
    expires_at: '2026-12-01T00:00:00.000Z',
    plan: {
      price_egp: 500,
      features: ['featured_badge', 'featured_home'],
      is_active: true,
    },
    ...overrides,
  }
}

describe('paid subscription feature eligibility', () => {
  it('allows a live paid non-trial plan that explicitly grants homepage placement', () => {
    expect(hasActivePaidPlanFeature(subscription(), 'featured_home', NOW)).toBe(true)
  })

  it('distinguishes a Featured badge from a Featured homepage placement', () => {
    const badgeOnly = subscription({
      plan: {
        price_egp: 300,
        features: ['featured_badge'],
        is_active: true,
      },
    })

    expect(hasActivePaidPlanFeature(badgeOnly, 'featured_badge', NOW)).toBe(true)
    expect(hasActivePaidPlanFeature(badgeOnly, 'featured_home', NOW)).toBe(false)
  })

  it('rejects free subscriptions and free plans', () => {
    expect(
      hasActivePaidPlanFeature(
        subscription({ plan: { price_egp: 0, features: ['featured_home'], is_active: true } }),
        'featured_home',
        NOW,
      ),
    ).toBe(false)
  })

  it('rejects trials even when their plan contains homepage placement', () => {
    expect(hasActivePaidPlanFeature(subscription({ is_trial: true, status: 'trial' }), 'featured_home', NOW)).toBe(false)
    expect(hasActivePaidPlanFeature(subscription({ is_trial: true }), 'featured_home', NOW)).toBe(false)
  })

  it('rejects inactive, not-yet-started, and expired subscriptions', () => {
    expect(hasActivePaidPlanFeature(subscription({ status: 'cancelled' }), 'featured_home', NOW)).toBe(false)
    expect(
      hasActivePaidPlanFeature(
        subscription({ starts_at: '2026-11-04T00:00:00.000Z' }),
        'featured_home',
        NOW,
      ),
    ).toBe(false)
    expect(
      hasActivePaidPlanFeature(
        subscription({ expires_at: '2026-11-02T00:00:00.000Z' }),
        'featured_home',
        NOW,
      ),
    ).toBe(false)
  })

  it('supports open-ended active subscriptions when the date columns are null', () => {
    expect(
      hasActivePaidPlanFeature(
        subscription({ starts_at: null, expires_at: null }),
        'featured_home',
        NOW,
      ),
    ).toBe(true)
  })
})
