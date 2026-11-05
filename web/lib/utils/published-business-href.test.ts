import { describe, expect, it } from 'vitest'
import { getPublishedBusinessHref } from './published-business-href'

describe('getPublishedBusinessHref', () => {
  it('returns the public route for a published business', () => {
    expect(getPublishedBusinessHref(true, 'eah-market')).toBe('/businesses/eah-market')
  })

  it('does not expose a public route for an unpublished business', () => {
    expect(getPublishedBusinessHref(false, 'eah-market')).toBeNull()
  })

  it('rejects an empty slug even when the business is published', () => {
    expect(getPublishedBusinessHref(true, '   ')).toBeNull()
  })
})
