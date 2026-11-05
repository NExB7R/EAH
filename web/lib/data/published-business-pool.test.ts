import { describe, expect, it } from 'vitest'
import { getPublishedBusinessLimit, onlyPublishedBusinessRows } from './published-business-pool'

describe('published business discovery pool', () => {
  it('keeps the home/default pool lightweight', () => {
    expect(getPublishedBusinessLimit()).toBe(100)
  })

  it('allows discovery to request up to 500 published activities', () => {
    expect(getPublishedBusinessLimit(500)).toBe(500)
  })

  it('clamps oversized, fractional, and invalid limits safely', () => {
    expect(getPublishedBusinessLimit(900)).toBe(500)
    expect(getPublishedBusinessLimit(25.9)).toBe(25)
    expect(getPublishedBusinessLimit(Number.NaN)).toBe(100)
  })

  it('excludes drafts and malformed publication values from public results', () => {
    const rows = [
      { id: 'published', is_published: true },
      { id: 'draft', is_published: false },
      { id: 'missing', is_published: undefined },
      { id: 'string', is_published: 'true' },
    ]
    expect(onlyPublishedBusinessRows(rows)).toEqual([{ id: 'published', is_published: true }])
  })

  it('returns an empty pool for null database results', () => {
    expect(onlyPublishedBusinessRows(null)).toEqual([])
  })
})
