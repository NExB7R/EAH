import { describe, expect, it } from 'vitest'
import { seededShuffle } from './seeded-shuffle'

describe('seededShuffle', () => {
  it('returns the same permutation for the same seed', () => {
    const items = Array.from({ length: 12 }, (_, index) => index)

    expect(seededShuffle(items, 'business-123')).toEqual(
      seededShuffle(items, 'business-123'),
    )
  })

  it('preserves every item without mutating the source array', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f']
    const original = [...items]
    const shuffled = seededShuffle(items, 'business-456')

    expect([...shuffled].sort()).toEqual([...items].sort())
    expect(new Set(shuffled).size).toBe(items.length)
    expect(items).toEqual(original)
  })

  it('handles empty and single-item lists', () => {
    expect(seededShuffle([], 'business-789')).toEqual([])
    expect(seededShuffle(['only'], 'business-789')).toEqual(['only'])
  })
})
