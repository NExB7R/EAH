import { describe, expect, it } from 'vitest'
import { parseFilters } from './filters'

describe('explore filters support all built-in business types', () => {
  it('accepts supermarket type from shared URLs', () => {
    expect(parseFilters({ type: 'supermarket' }).types).toEqual(['supermarket'])
  })

  it('ignores unknown types instead of passing them into the data query', () => {
    expect(parseFilters({ type: 'future-type' }).types).toEqual([])
  })
})
