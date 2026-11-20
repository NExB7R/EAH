import { describe, expect, it } from 'vitest'
import {
  isCacheablePublicImageUrl,
  resolveSafeNotificationUrl,
  shouldUseNetworkOnly,
} from './service-worker-policy'

const APP_ORIGIN = 'https://eah.example'
const SUPABASE_HOST = 'project.supabase.co'

describe('service worker request cache policy', () => {
  it('keeps HTML documents network-only', () => {
    expect(
      shouldUseNetworkOnly({
        sameOrigin: true,
        pathname: '/admin',
        destination: 'document',
        headers: new Headers(),
      }),
    ).toBe(true)
  })

  it('keeps all API paths and Next.js data requests network-only', () => {
    const noHeaders = new Headers()
    for (const pathname of ['/api', '/api/admin/live-feed', '/_next/data/build-id/account.json']) {
      expect(
        shouldUseNetworkOnly({
          sameOrigin: true,
          pathname,
          destination: '',
          headers: noHeaders,
        }),
      ).toBe(true)
    }
  })

  it('keeps RSC and both router prefetch request types network-only', () => {
    for (const name of ['RSC', 'Next-Router-Prefetch', 'Next-Router-Segment-Prefetch']) {
      expect(
        shouldUseNetworkOnly({
          sameOrigin: true,
          pathname: '/account',
          destination: '',
          headers: new Headers({ [name]: '1' }),
        }),
      ).toBe(true)
    }
  })

  it('does not classify cross-origin requests as same-origin private routes', () => {
    expect(
      shouldUseNetworkOnly({
        sameOrigin: false,
        pathname: '/api/private',
        destination: '',
        headers: new Headers(),
      }),
    ).toBe(false)
  })
})

describe('public image cache allowlist', () => {
  it('allows only named local brand and application icons', () => {
    expect(isCacheablePublicImageUrl('/eah-word.webp', APP_ORIGIN, SUPABASE_HOST)).toBe(true)
    expect(isCacheablePublicImageUrl('/icon-192.png', APP_ORIGIN, SUPABASE_HOST)).toBe(true)
    expect(
      isCacheablePublicImageUrl('/account/private-avatar.png', APP_ORIGIN, SUPABASE_HOST),
    ).toBe(false)
    expect(
      isCacheablePublicImageUrl('/api/private-image.png', APP_ORIGIN, SUPABASE_HOST),
    ).toBe(false)
  })

  it('allows explicit public image services and public Supabase storage only', () => {
    expect(
      isCacheablePublicImageUrl(
        'https://res.cloudinary.com/eah/image/upload/businesses/cover.webp',
        APP_ORIGIN,
        SUPABASE_HOST,
      ),
    ).toBe(true)
    expect(
      isCacheablePublicImageUrl(
        'https://project.supabase.co/storage/v1/object/public/businesses/cover.webp',
        APP_ORIGIN,
        SUPABASE_HOST,
      ),
    ).toBe(true)
    expect(
      isCacheablePublicImageUrl(
        'https://project.supabase.co/storage/v1/object/sign/private/avatar.png?token=secret',
        APP_ORIGIN,
        SUPABASE_HOST,
      ),
    ).toBe(false)
    expect(
      isCacheablePublicImageUrl(
        'https://res.cloudinary.com/eah/image/authenticated/private.png',
        APP_ORIGIN,
        SUPABASE_HOST,
      ),
    ).toBe(false)
  })

  it('rejects unknown hosts, insecure URLs and data URLs', () => {
    expect(
      isCacheablePublicImageUrl('https://unknown.example/photo.jpg', APP_ORIGIN, SUPABASE_HOST),
    ).toBe(false)
    expect(
      isCacheablePublicImageUrl(
        'http://res.cloudinary.com/eah/image/upload/cover.jpg',
        APP_ORIGIN,
        SUPABASE_HOST,
      ),
    ).toBe(false)
    expect(isCacheablePublicImageUrl('data:image/png;base64,abc', APP_ORIGIN, SUPABASE_HOST)).toBe(
      false,
    )
  })
})

describe('safe notification navigation', () => {
  it('resolves same-origin relative and absolute URLs', () => {
    expect(resolveSafeNotificationUrl('/account/notifications?id=3#latest', APP_ORIGIN)).toBe(
      'https://eah.example/account/notifications?id=3#latest',
    )
    expect(resolveSafeNotificationUrl('https://eah.example/admin', APP_ORIGIN)).toBe(
      'https://eah.example/admin',
    )
  })

  it('rejects external, protocol-relative, script and credential-bearing URLs', () => {
    for (const value of [
      'https://attacker.example',
      '//attacker.example',
      'javascript:alert(1)',
      'data:text/html,hello',
      'https://user:password@eah.example/admin',
    ]) {
      expect(resolveSafeNotificationUrl(value, APP_ORIGIN)).toBe('https://eah.example/')
    }
  })

  it('uses a safe fallback for invalid values and oversized input', () => {
    expect(resolveSafeNotificationUrl(null, APP_ORIGIN)).toBe('https://eah.example/')
    expect(resolveSafeNotificationUrl('x'.repeat(2049), APP_ORIGIN)).toBe('https://eah.example/')
  })
})
