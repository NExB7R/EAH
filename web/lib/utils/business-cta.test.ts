import { describe, expect, it } from 'vitest'
import { shouldRenderFixedBusinessCta } from './business-cta'

describe('shouldRenderFixedBusinessCta', () => {
  it('shows the owner management action without contact or ordering', () => {
    expect(
      shouldRenderFixedBusinessCta({
        isOwner: true,
        ordersEnabled: false,
        contactOptions: [],
      }),
    ).toBe(true)
  })

  it('shows in-app ordering when enabled', () => {
    expect(
      shouldRenderFixedBusinessCta({
        ordersEnabled: true,
        contactOptions: [],
      }),
    ).toBe(true)
  })

  it('shows WhatsApp contact but not phone-only contact', () => {
    expect(
      shouldRenderFixedBusinessCta({
        ordersEnabled: false,
        contactOptions: [{ method: 'whatsapp' }],
      }),
    ).toBe(true)

    expect(
      shouldRenderFixedBusinessCta({
        ordersEnabled: false,
        contactOptions: [{ method: 'phone' }],
      }),
    ).toBe(false)
  })

  it('hides the sticky action when no supported action exists', () => {
    expect(
      shouldRenderFixedBusinessCta({
        ordersEnabled: false,
        contactOptions: [],
      }),
    ).toBe(false)
  })
})
