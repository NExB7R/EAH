import { describe, expect, it } from 'vitest'
import { canAcceptInAppOrders } from './order-availability'

describe('in-app order availability', () => {
  it('requires enabled orders and a linked owner', () => {
    expect(canAcceptInAppOrders(true, 'user-123')).toBe(true)
    expect(canAcceptInAppOrders(false, 'user-123')).toBe(false)
    expect(canAcceptInAppOrders(true, null)).toBe(false)
  })

  it('fails closed for empty or malformed owner identifiers', () => {
    expect(canAcceptInAppOrders(true, '')).toBe(false)
    expect(canAcceptInAppOrders(true, '   ')).toBe(false)
    expect(canAcceptInAppOrders(true, 123)).toBe(false)
    expect(canAcceptInAppOrders(undefined, 'user-123')).toBe(false)
  })
})
