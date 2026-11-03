import { describe, expect, it } from 'vitest'
import { isPromotionActive } from './promotion-status'

describe('isPromotionActive', () => {
  const now = Date.parse('2026-11-03T12:00:00.000Z')

  it('keeps enabled placements without an expiry active', () => {
    expect(isPromotionActive(true, null, now)).toBe(true)
    expect(isPromotionActive(true, undefined, now)).toBe(true)
  })

  it('hides disabled and expired placements', () => {
    expect(isPromotionActive(false, '2026-11-04T00:00:00.000Z', now)).toBe(false)
    expect(isPromotionActive(true, '2026-11-03T11:59:59.999Z', now)).toBe(false)
  })

  it('keeps a placement active through its exact expiry instant', () => {
    expect(isPromotionActive(true, '2026-11-03T12:00:00.000Z', now)).toBe(true)
    expect(isPromotionActive(true, '2026-11-03T12:00:00.001Z', now)).toBe(true)
  })

  it('fails closed for invalid expiry values', () => {
    expect(isPromotionActive(true, 'not-a-date', now)).toBe(false)
    expect(isPromotionActive(true, 12345, now)).toBe(false)
  })
})
