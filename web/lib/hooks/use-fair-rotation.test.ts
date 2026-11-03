import { describe, expect, it } from 'vitest'
import { sliceVisible } from './use-fair-rotation'

describe('sliceVisible', () => {
  it('does not wrap the last partial page to already-shown items', () => {
    const order = Array.from({ length: 10 }, (_, index) => index + 1)
    const pages = [sliceVisible(order, 0, 4), sliceVisible(order, 4, 4), sliceVisible(order, 8, 4)]

    expect(pages).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]])
    expect(pages.flat()).toEqual(order)
    expect(new Set(pages.flat()).size).toBe(order.length)
  })

  it('returns an empty page for an empty list or invalid page size', () => {
    expect(sliceVisible([], 0, 4)).toEqual([])
    expect(sliceVisible([1, 2, 3], 0, 0)).toEqual([])
  })

  it('keeps a full last page when the list divides evenly', () => {
    expect(sliceVisible([1, 2, 3, 4, 5, 6, 7, 8], 4, 4)).toEqual([5, 6, 7, 8])
  })
})
