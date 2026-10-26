import { describe, expect, it } from 'vitest'
import { safeAdHref } from './safe-ad-link'

describe('safe ad destination URLs', () => {
  it('keeps valid HTTP(S) destinations and internal paths', () => {
    expect(safeAdHref('https://example.com/promo')).toBe('https://example.com/promo')
    expect(safeAdHref('http://example.com/promo')).toBe('http://example.com/promo')
    expect(safeAdHref('/businesses/example-shop')).toBe('/businesses/example-shop')
  })

  it('rejects executable, protocol-relative, malformed, and control-character URLs', () => {
    expect(safeAdHref('javascript:alert(1)')).toBeNull()
    expect(safeAdHref('data:text/html,hello')).toBeNull()
    expect(safeAdHref('//evil.example/promo')).toBeNull()
    expect(safeAdHref('/\\\\evil.example/promo')).toBeNull()
    expect(safeAdHref('https://example.com/\nnext')).toBeNull()
    expect(safeAdHref('not-a-url')).toBeNull()
    expect(safeAdHref(null)).toBeNull()
  })
})
