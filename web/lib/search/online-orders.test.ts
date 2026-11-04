import { describe, expect, it } from 'vitest'
import { canReceiveInAppOrders, filterInAppOrderBusinesses } from './online-orders'

describe('in-app order availability', () => {
  it('uses the in-app order flag and never the WhatsApp channel', () => {
    const inAppEnabled = { id: 'in-app', accepts_orders: true, accepts_whatsapp_orders: false }
    const whatsappOnly = { id: 'whatsapp', accepts_orders: false, accepts_whatsapp_orders: true }
    const disabled = { id: 'disabled', accepts_orders: false, accepts_whatsapp_orders: false }

    expect(canReceiveInAppOrders(inAppEnabled)).toBe(true)
    expect(canReceiveInAppOrders(whatsappOnly)).toBe(false)
    expect(filterInAppOrderBusinesses([whatsappOnly, disabled, inAppEnabled])).toEqual([
      inAppEnabled,
    ])
  })

  it('fails closed for null or undefined in-app flags', () => {
    expect(canReceiveInAppOrders({ accepts_orders: null } as never)).toBe(false)
    expect(canReceiveInAppOrders({ accepts_orders: undefined } as never)).toBe(false)
  })
})
