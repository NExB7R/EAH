import { describe, it, expect } from 'vitest'
import { getReadinessGrade, computeWeightedPercent } from './launch-readiness-utils'

describe('getReadinessGrade', () => {
  it('returns "جاهز للإطلاق" for 90+', () => {
    expect(getReadinessGrade(90).label).toBe('جاهز للإطلاق')
    expect(getReadinessGrade(95).label).toBe('جاهز للإطلاق')
    expect(getReadinessGrade(100).label).toBe('جاهز للإطلاق')
  })

  it('returns "قريب جدًا" for 75-89', () => {
    expect(getReadinessGrade(75).label).toBe('قريب جدًا')
    expect(getReadinessGrade(89).label).toBe('قريب جدًا')
  })

  it('returns "شغل كتير متبقي" for 50-74', () => {
    expect(getReadinessGrade(50).label).toBe('شغل كتير متبقي')
    expect(getReadinessGrade(74).label).toBe('شغل كتير متبقي')
  })

  it('returns "محتاج شغل كبير" for <50', () => {
    expect(getReadinessGrade(0).label).toBe('محتاج شغل كبير')
    expect(getReadinessGrade(49).label).toBe('محتاج شغل كبير')
  })

  it('returns different colors for different grades', () => {
    const ready = getReadinessGrade(95).color
    const warning = getReadinessGrade(60).color
    const blocker = getReadinessGrade(20).color
    expect(ready).not.toBe(warning)
    expect(warning).not.toBe(blocker)
    expect(ready).not.toBe(blocker)
  })
})

describe('computeWeightedPercent', () => {
  it('returns 100 for all ready', () => {
    const pct = computeWeightedPercent([
      { status: 'ready', weight: 3 },
      { status: 'ready', weight: 2 },
      { status: 'ready', weight: 1 },
    ])
    expect(pct).toBe(100)
  })

  it('returns 0 for all blockers', () => {
    const pct = computeWeightedPercent([
      { status: 'blocker', weight: 3 },
      { status: 'blocker', weight: 2 },
    ])
    expect(pct).toBe(0)
  })

  it('counts warnings as 50%', () => {
    const pct = computeWeightedPercent([
      { status: 'ready', weight: 2 },
      { status: 'warning', weight: 2 },
    ])
    // (2*1 + 2*0.5) / 4 = 75%
    expect(pct).toBe(75)
  })

  it('respects weights', () => {
    const pct = computeWeightedPercent([
      { status: 'ready', weight: 3 },
      { status: 'blocker', weight: 1 },
    ])
    // 3/4 = 75%
    expect(pct).toBe(75)
  })

  it('returns 0 for empty array', () => {
    expect(computeWeightedPercent([])).toBe(0)
  })

  it('handles realistic mix', () => {
    const pct = computeWeightedPercent([
      { status: 'ready', weight: 3 },  // DB
      { status: 'ready', weight: 3 },  // RLS
      { status: 'ready', weight: 3 },  // Businesses
      { status: 'ready', weight: 2 },  // Reviews
      { status: 'warning', weight: 3 }, // Real businesses (demo only)
      { status: 'ready', weight: 2 },  // Merchants
      { status: 'ready', weight: 3 },  // Standing
      { status: 'ready', weight: 2 },  // Autopilot
      { status: 'ready', weight: 3 },  // Contact privacy
      { status: 'ready', weight: 1 },  // Orphan branches
      { status: 'warning', weight: 2 }, // Demo data
    ])
    // (3+3+3+2+1.5+2+3+2+3+1+1) / 27 = 24.5/27 = 0.907 → 91%
    expect(pct).toBeGreaterThanOrEqual(85)
    expect(pct).toBeLessThanOrEqual(95)
  })
})
