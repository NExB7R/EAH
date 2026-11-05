import { describe, expect, it } from 'vitest'
import {
  nextPageStart,
  previousPageStart,
  refreshOrderItems,
  sliceVisible,
} from './use-fair-rotation'

function collectOneRotationCycle<T>(ids: T[], pageSize: number): T[][] {
  const pages = [sliceVisible(ids, 0, pageSize)]
  let cursor = 0
  let coveredUntil = Math.min(ids.length, pageSize)

  for (let step = 0; step <= ids.length; step++) {
    const next = nextPageStart(cursor, ids.length, pageSize, coveredUntil)
    if (next === 0) return pages

    cursor = next
    pages.push(sliceVisible(ids, cursor, pageSize))
    coveredUntil = Math.min(ids.length, cursor + pageSize)
  }

  throw new Error('Rotation cycle did not complete')
}
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


describe('fair rotation cycle coverage', () => {
  it('shows every eligible item exactly once before resetting across mobile, tablet and desktop sizes', () => {
    for (const pageSize of [4, 6, 8]) {
      for (let count = 0; count <= 40; count++) {
        const ids = Array.from({ length: count }, (_, index) => 'business-' + index)
        const pages = collectOneRotationCycle(ids, pageSize)
        const flattened = pages.flat()

        expect(flattened).toEqual(ids)
        expect(new Set(flattened).size).toBe(count)
        expect(pages.every((page) => page.length <= pageSize)).toBe(true)
      }
    }
  })

  it('preserves already-covered items when a desktop page shrinks to mobile', () => {
    const ids = Array.from({ length: 20 }, (_, index) => index)
    const firstDesktopPage = sliceVisible(ids, 0, 8)
    const coveredUntil = firstDesktopPage.length
    const nextMobileCursor = nextPageStart(0, ids.length, 4, coveredUntil)
    const nextMobilePage = sliceVisible(ids, nextMobileCursor, 4)

    expect(firstDesktopPage).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
    expect(nextMobilePage).toEqual([8, 9, 10, 11])
  })

  it('extends covered progress when a mobile page grows to desktop', () => {
    const ids = Array.from({ length: 20 }, (_, index) => index)
    const firstMobilePage = sliceVisible(ids, 0, 4)
    const coveredUntil = Math.max(firstMobilePage.length, 8)
    const nextDesktopCursor = nextPageStart(0, ids.length, 8, coveredUntil)

    expect(firstMobilePage).toEqual([0, 1, 2, 3])
    expect(nextDesktopCursor).toBe(8)
  })
})


describe('refreshOrderItems', () => {
  it('keeps the randomized order while replacing stale records with current data', () => {
    const oldOrder = [
      { id: 'business-b', name: 'Old B' },
      { id: 'business-a', name: 'Old A' },
    ]
    const latestItems = [
      { id: 'business-a', name: 'Updated A' },
      { id: 'business-b', name: 'Updated B' },
    ]

    expect(refreshOrderItems(oldOrder, latestItems)).toEqual([
      latestItems[1],
      latestItems[0],
    ])
  })

  it('returns null when the eligible item set changes', () => {
    const oldOrder = [{ id: 'business-a' }, { id: 'business-b' }]
    const latestItems = [{ id: 'business-a' }, { id: 'business-c' }]

    expect(refreshOrderItems(oldOrder, latestItems)).toBeNull()
  })

  it('rejects an order with duplicate IDs so no eligible activity is lost', () => {
    const duplicateOrder = [{ id: 'business-a' }, { id: 'business-a' }]
    const latestItems = [{ id: 'business-a' }, { id: 'business-b' }]

    expect(refreshOrderItems(duplicateOrder, latestItems)).toBeNull()
  })
})

