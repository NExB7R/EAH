import { describe, expect, it } from 'vitest'
import { getBusinessReputationScore } from './reputation'

describe('business reputation evidence', () => {
  it('does not award reputation for missing evidence or participation points', () => {
    expect(getBusinessReputationScore({})).toBe(0)
    expect(getBusinessReputationScore({ trust_score: 100 } as never)).toBe(0)
  })

  it('keeps administrative verification separate from ratings and orders', () => {
    expect(getBusinessReputationScore({ is_verified: true })).toBe(20)
    expect(getBusinessReputationScore({ is_verified: false })).toBe(0)
  })

  it('requires review volume before ratings carry much weight', () => {
    const oneReview = getBusinessReputationScore({ rating_avg: 5, rating_count: 1 })
    const tenReviews = getBusinessReputationScore({ rating_avg: 5, rating_count: 10 })
    expect(tenReviews).toBeGreaterThan(oneReview)
    expect(oneReview).toBeLessThan(20)
  })

  it('rewards completed platform orders without treating clicks or likes as evidence', () => {
    const fewOrders = getBusinessReputationScore({ successful_orders: 1 })
    const manyOrders = getBusinessReputationScore({ successful_orders: 20 })
    expect(manyOrders).toBeGreaterThan(fewOrders)
  })

  it('stays within range and ignores malformed values', () => {
    expect(getBusinessReputationScore({
      is_verified: true,
      rating_avg: 99,
      rating_count: 100000,
      successful_orders: 100000,
    })).toBeLessThanOrEqual(100)
    expect(getBusinessReputationScore({ rating_avg: Number.NaN, rating_count: -5 })).toBe(0)
  })
})
