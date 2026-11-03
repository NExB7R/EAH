import { describe, expect, it } from 'vitest'
import {
  clampFairRotationCursor,
  getNextFairRotationCursor,
  sliceFairRotation,
} from './fair-rotation'

describe('fair featured rotation', () => {
  it('shows the partial tail page before restarting a shuffled cycle', () => {
    const order = ['a', 'b', 'c', 'd', 'e']

    const firstPage = sliceFairRotation(order, 0, 4)
    expect(firstPage).toEqual(['a', 'b', 'c', 'd'])

    const next = getNextFairRotationCursor(order.length, 0, firstPage.length)
    expect(next).toEqual({ cursor: 4, restart: false })

    const finalPage = sliceFairRotation(order, next.cursor, 4)
    expect(finalPage).toEqual(['e'])

    const restart = getNextFairRotationCursor(order.length, next.cursor, finalPage.length)
    expect(restart).toEqual({ cursor: 0, restart: true })
    expect([...firstPage, ...finalPage]).toEqual(order)
  })

  it('advances by the cards already shown when the viewport size changes', () => {
    const order = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']

    // Mobile showed four cards. The visitor resizes to desktop before pressing next.
    const next = getNextFairRotationCursor(order.length, 0, 4)
    expect(next).toEqual({ cursor: 4, restart: false })

    const desktopPage = sliceFairRotation(order, next.cursor, 8)
    expect(desktopPage).toEqual(['e', 'f', 'g', 'h', 'i', 'j'])

    const restart = getNextFairRotationCursor(order.length, next.cursor, desktopPage.length)
    expect(restart.restart).toBe(true)
    expect([...order.slice(0, 4), ...desktopPage]).toEqual(order)
  })

  it('does not wrap a short page to repeat items from the same cycle', () => {
    const order = ['a', 'b', 'c']
    expect(sliceFairRotation(order, 0, 8)).toEqual(order)
    expect(sliceFairRotation(order, 3, 8)).toEqual([])
  })

  it('clamps persisted cursors to the current eligible list', () => {
    expect(clampFairRotationCursor(5, 99)).toBe(4)
    expect(clampFairRotationCursor(5, -2)).toBe(0)
    expect(clampFairRotationCursor(0, 3)).toBe(0)
    expect(clampFairRotationCursor(5, Number.NaN)).toBe(0)
  })
})
