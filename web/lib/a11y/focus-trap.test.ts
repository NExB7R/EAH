import { describe, expect, it, vi } from 'vitest'
import { getFocusWrapTarget } from './focus-trap'

function focusable() {
  return { focus: vi.fn() }
}

describe('getFocusWrapTarget', () => {
  it('wraps Tab from the last focusable item to the first', () => {
    const first = focusable()
    const middle = focusable()
    const last = focusable()

    expect(getFocusWrapTarget([first, middle, last], last, false, false)).toBe(first)
  })

  it('wraps Shift+Tab from the first focusable item to the last', () => {
    const first = focusable()
    const middle = focusable()
    const last = focusable()

    expect(getFocusWrapTarget([first, middle, last], first, true, false)).toBe(last)
  })

  it('recovers focus that escaped the dialog in the forward direction', () => {
    const first = focusable()
    const last = focusable()

    expect(getFocusWrapTarget([first, last], null, false, true)).toBe(first)
  })

  it('recovers focus that escaped the dialog in the reverse direction', () => {
    const first = focusable()
    const last = focusable()

    expect(getFocusWrapTarget([first, last], null, true, true)).toBe(last)
  })

  it('does not interrupt Tab navigation between middle items', () => {
    const first = focusable()
    const middle = focusable()
    const last = focusable()

    expect(getFocusWrapTarget([first, middle, last], middle, false, false)).toBeNull()
    expect(getFocusWrapTarget([first, middle, last], middle, true, false)).toBeNull()
  })

  it('returns null when the dialog has no focusable items', () => {
    expect(getFocusWrapTarget([], null, false, true)).toBeNull()
  })
})
