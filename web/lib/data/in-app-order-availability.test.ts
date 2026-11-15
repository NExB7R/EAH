import { describe, expect, it } from 'vitest'
import { isInAppOrderOperational, type InAppOrderSettings } from './in-app-order-availability-core'

const activeSettings: InAppOrderSettings = {
  orders_enabled: true,
  deadline_minutes: 10,
  delivery_eta_minutes: 30,
  offline_mode: false,
  offline_until: null,
  suspended_until: null,
}

describe('in-app order availability', () => {
  it('requires an enabled activity, linked seller, and running settings', () => {
    expect(isInAppOrderOperational(true, 'seller-id', activeSettings, 0)).toBe(true)
    expect(isInAppOrderOperational(false, 'seller-id', activeSettings, 0)).toBe(false)
    expect(isInAppOrderOperational(true, null, activeSettings, 0)).toBe(false)
    expect(isInAppOrderOperational(true, 'seller-id', null, 0)).toBe(false)
  })

  it('fails closed when orders are disabled or timing settings are invalid', () => {
    expect(
      isInAppOrderOperational(true, 'seller-id', { ...activeSettings, orders_enabled: false }, 0),
    ).toBe(false)
    expect(
      isInAppOrderOperational(
        true,
        'seller-id',
        { ...activeSettings, delivery_eta_minutes: null },
        0,
      ),
    ).toBe(false)
    expect(
      isInAppOrderOperational(true, 'seller-id', { ...activeSettings, deadline_minutes: 0 }, 0),
    ).toBe(false)
  })

  it('fails closed for active or malformed offline/suspension windows', () => {
    expect(
      isInAppOrderOperational(
        true,
        'seller-id',
        { ...activeSettings, offline_mode: true, offline_until: null },
        1000,
      ),
    ).toBe(false)
    expect(
      isInAppOrderOperational(
        true,
        'seller-id',
        { ...activeSettings, offline_mode: true, offline_until: 'not-a-date' },
        1000,
      ),
    ).toBe(false)
    expect(
      isInAppOrderOperational(
        true,
        'seller-id',
        { ...activeSettings, suspended_until: new Date(2000).toISOString() },
        1000,
      ),
    ).toBe(false)
    expect(
      isInAppOrderOperational(
        true,
        'seller-id',
        { ...activeSettings, offline_mode: true, offline_until: new Date(500).toISOString() },
        1000,
      ),
    ).toBe(true)
  })
})
