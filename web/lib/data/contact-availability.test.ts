import { describe, expect, it } from 'vitest'
import { hasNonEmptyContact, isWhatsAppChannelAvailable } from './contact-availability'

describe('public WhatsApp channel availability', () => {
  const configured = new Set(['business-with-branch-whatsapp', 'business-with-public-whatsapp'])

  it('requires the feature flag and at least one configured destination', () => {
    expect(isWhatsAppChannelAvailable(true, 'business-with-branch-whatsapp', configured)).toBe(
      true,
    )
    expect(
      isWhatsAppChannelAvailable(true, 'business-with-public-whatsapp', configured),
    ).toBe(true)
  })

  it('hides the channel when the flag is off or the destination is missing', () => {
    expect(isWhatsAppChannelAvailable(false, 'business-with-branch-whatsapp', configured)).toBe(
      false,
    )
    expect(isWhatsAppChannelAvailable(true, 'business-without-whatsapp', configured)).toBe(false)
    expect(isWhatsAppChannelAvailable(true, null, configured)).toBe(false)
  })

  it('treats only non-empty string destinations as configured', () => {
    expect(hasNonEmptyContact('+201234567890')).toBe(true)
    expect(hasNonEmptyContact('   ')).toBe(false)
    expect(hasNonEmptyContact(null)).toBe(false)
    expect(hasNonEmptyContact(123456)).toBe(false)
  })
})
