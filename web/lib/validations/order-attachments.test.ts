import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  isAllowedOrderAttachmentUrl,
  parseOrderAttachments,
  signOrderAttachment,
  verifyOrderAttachment,
} from './order-attachments'

const secret = 'test-attachment-signing-secret'
const userId = 'customer-123'

describe('order attachment validation', () => {
  it('allows only HTTPS Cloudinary URLs in the EAH orders folder', () => {
    expect(
      isAllowedOrderAttachmentUrl(
        'https://res.cloudinary.com/demo/image/upload/v123/eah/orders/photo.jpg',
      ),
    ).toBe(true)
    expect(isAllowedOrderAttachmentUrl('https://evil.example/eah/orders/photo.jpg')).toBe(false)
    expect(
      isAllowedOrderAttachmentUrl(
        'https://res.cloudinary.com/demo/image/upload/v123/other-folder/photo.jpg',
      ),
    ).toBe(false)
    expect(
      isAllowedOrderAttachmentUrl(
        'https://res.cloudinary.com/demo/image/upload/v123/eah/orders/photo.jpg?redirect=evil',
      ),
    ).toBe(false)
    expect(isAllowedOrderAttachmentUrl('http://res.cloudinary.com/demo/eah/orders/photo.jpg')).toBe(
      false,
    )
  })

  it('signs attachment metadata for one user and expires it', () => {
    const now = Math.floor(Date.now() / 1000)
    const attachment = {
      type: 'image' as const,
      url: 'https://res.cloudinary.com/demo/image/upload/v123/eah/orders/photo.jpg',
      size: 2048,
      mime: 'image/jpeg',
      expires_at: now + 600,
    }
    const signed = {
      ...attachment,
      signature: signOrderAttachment(userId, attachment, secret),
    }

    expect(verifyOrderAttachment(userId, signed, secret, now)).toBe(true)
    expect(verifyOrderAttachment('another-user', signed, secret, now)).toBe(false)
    expect(verifyOrderAttachment(userId, signed, 'wrong-secret', now)).toBe(false)
    expect(verifyOrderAttachment(userId, signed, secret, attachment.expires_at + 1)).toBe(false)
  })

  it('rejects malformed, unsupported, and overlong attachment payloads', () => {
    expect(parseOrderAttachments('{')).toBeNull()
    expect(parseOrderAttachments(JSON.stringify([{ type: 'image', url: 'https://evil.example/x' }]))).toBe(
      null,
    )
    expect(parseOrderAttachments(JSON.stringify(Array.from({ length: 6 }, () => ({}))))).toBeNull()
  })

  it('accepts a valid signed attachment payload', () => {
    const now = Math.floor(Date.now() / 1000)
    const attachment = {
      type: 'voice' as const,
      url: 'https://res.cloudinary.com/demo/video/upload/v123/eah/orders/voice.webm',
      size: 4096,
      mime: 'audio/webm',
      duration_sec: 28,
      expires_at: now + 300,
    }
    const signed = {
      ...attachment,
      signature: signOrderAttachment(userId, attachment, secret),
    }
    const parsed = parseOrderAttachments(JSON.stringify([signed]))
    expect(parsed).toHaveLength(1)
    expect(parsed?.[0] && verifyOrderAttachment(userId, parsed[0], secret, now)).toBe(true)
  })
})
