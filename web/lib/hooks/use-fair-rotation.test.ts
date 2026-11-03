import { describe, expect, it } from 'vitest'
import { nextPageStart, previousPageStart, sliceVisible } from './use-fair-rotation'

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


describe('featured rotation page cursor', () => {
  it('reaches the final partial page before starting a new cycle', () => {
    const length = 10
    const size = 4
    const starts = [0]
    for (let index = 0; index < 3; index++) {
      starts.push(nextPageStart(starts[starts.length - 1]!, length, size))
    }
    expect(starts).toEqual([0, 4, 8, 0])
  })

  it('does not wrap backward from the first page', () => {
    expect(previousPageStart(0, 4)).toBe(0)
    expect(previousPageStart(8, 4)).toBe(4)
  })

  it('keeps unseen progress when the viewport shrinks from eight cards to four', () => {
    expect(nextPageStart(0, 10, 4, 8)).toBe(8)
    expect(nextPageStart(8, 10, 4, 10)).toBe(0)
  })

  it('accounts for newly visible cards when the viewport grows', () => {
    expect(nextPageStart(0, 10, 8, 8)).toBe(8)
  })

  it('does not replay previously seen cards after navigating backward', () => {
    expect(nextPageStart(4, 10, 4, 8)).toBe(8)
  })
})
