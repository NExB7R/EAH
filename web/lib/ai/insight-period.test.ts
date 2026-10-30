import { describe, expect, it } from 'vitest'
import { getInsightDateRange } from './insight-period'

const DAY_MS = 24 * 60 * 60 * 1000
const NOW = Date.parse('2026-10-30T12:00:00.000Z')

describe('getInsightDateRange', () => {
  it('uses one consistent range for a valid requested period', () => {
    const range = getInsightDateRange(14, 90, NOW)

    expect(range.days).toBe(14)
    expect(range.end).toBe('2026-10-30T12:00:00.000Z')
    expect(Date.parse(range.end) - Date.parse(range.start)).toBe(14 * DAY_MS)
  })

  it('clamps fractional and out-of-range values', () => {
    expect(getInsightDateRange(14.9, 90, NOW).days).toBe(14)
    expect(getInsightDateRange(-20, 90, NOW).days).toBe(1)
    expect(getInsightDateRange(500, 90, NOW).days).toBe(90)
  })

  it('falls back safely for non-numeric, NaN and infinite inputs', () => {
    expect(getInsightDateRange('7', 90, NOW).days).toBe(30)
    expect(getInsightDateRange(Number.NaN, 90, NOW).days).toBe(30)
    expect(getInsightDateRange(Number.POSITIVE_INFINITY, 90, NOW).days).toBe(30)
  })

  it('keeps the fallback inside a smaller configured maximum', () => {
    expect(getInsightDateRange(Number.NaN, 7, NOW).days).toBe(7)
    expect(getInsightDateRange(30, 7, NOW).days).toBe(7)
  })
})
