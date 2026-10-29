import { describe, expect, it } from 'vitest'
import {
  hasUsablePhoneDestination,
  hasUsableWhatsAppDestination,
  isWhatsAppChannelAvailable,
  normalizePhoneDestination,
  normalizeWhatsAppDestination,
} from './contact-availability-utils'

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

  it('accepts usable Egyptian and international WhatsApp number formats', () => {
    expect(normalizeWhatsAppDestination('01012345678')).toBe('201012345678')
    expect(normalizeWhatsAppDestination('+201012345678')).toBe('201012345678')
    expect(normalizeWhatsAppDestination('https://wa.me/201012345678')).toBe('201012345678')
    expect(normalizeWhatsAppDestination('+447911123456')).toBe('447911123456')
    expect(normalizeWhatsAppDestination('00447911123456')).toBe('447911123456')
    expect(normalizePhoneDestination('+201012345678')).toBe('+201012345678')
    expect(normalizePhoneDestination('010 1234 5678')).toBe('01012345678')
  })

  it('fails closed for empty, malformed, or non-string WhatsApp destinations', () => {
    expect(hasUsableWhatsAppDestination('01012345678')).toBe(true)
    expect(hasUsablePhoneDestination('01012345678')).toBe(true)
    expect(hasUsablePhoneDestination('call 01012345678')).toBe(false)
    expect(hasUsableWhatsAppDestination('   ')).toBe(false)
    expect(hasUsableWhatsAppDestination('not a phone')).toBe(false)
    expect(hasUsableWhatsAppDestination('123')).toBe(false)
    expect(hasUsableWhatsAppDestination(null)).toBe(false)
    expect(normalizeWhatsAppDestination(201012345678)).toBeNull()
  })
})
