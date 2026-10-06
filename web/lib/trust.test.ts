import { describe, it, expect } from 'vitest'
import {
  getTrustTier,
  getTrustTierMeta,
  getTrustFactor,
  effectiveDelta,
  trustProgress,
  TRUST_TIERS,
  TRUST_MIN,
  TRUST_MAX,
  TRUST_DEFAULT,
} from './trust'

// ═══════════════════════════════════════════════════════════
// Trust System 2.0 — Tests
// ═══════════════════════════════════════════════════════════

describe('getTrustTier', () => {
  it('0-19 → baraka', () => {
    expect(getTrustTier(0)).toBe('bade2')
    expect(getTrustTier(19)).toBe('bade2')
  })
  it('20-39 → active', () => {
    expect(getTrustTier(20)).toBe('mashey')
    expect(getTrustTier(39)).toBe('mashey')
  })
  it('40-59 → mo3tabar', () => {
    expect(getTrustTier(40)).toBe('fel')
    expect(getTrustTier(59)).toBe('fel')
  })
  it('60-79 → kebeer', () => {
    expect(getTrustTier(60)).toBe('harif')
    expect(getTrustTier(79)).toBe('harif')
  })
  it('80-100 → legend', () => {
    expect(getTrustTier(80)).toBe('ostora')
    expect(getTrustTier(100)).toBe('ostora')
  })
  it('بيتعامل مع القيم بره المدى', () => {
    expect(getTrustTier(-50)).toBe('bade2')
    expect(getTrustTier(200)).toBe('ostora')
  })
})

describe('TRUST_TIERS', () => {
  it('عندها 5 مستويات', () => {
    expect(Object.keys(TRUST_TIERS)).toHaveLength(5)
  })
  it('كل مستوى فيه label + emoji + color', () => {
    for (const tier of Object.values(TRUST_TIERS)) {
      expect(tier.label).toBeTruthy()
      expect(tier.emoji).toBeTruthy()
      expect(tier.color).toBeTruthy()
    }
  })
  it('المستويات بدون فراغات', () => {
    expect(TRUST_TIERS.bade2.max + 1).toBe(TRUST_TIERS.mashey.min)
    expect(TRUST_TIERS.mashey.max + 1).toBe(TRUST_TIERS.fel.min)
    expect(TRUST_TIERS.fel.max + 1).toBe(TRUST_TIERS.harif.min)
    expect(TRUST_TIERS.harif.max + 1).toBe(TRUST_TIERS.ostora.min)
  })
})

describe('getTrustTierMeta', () => {
  it('يرجع الاسم الصحيح', () => {
    expect(getTrustTierMeta(50).label).toBe('زي الفل')
  })
  it('يرجع الـ emoji', () => {
    expect(getTrustTierMeta(90).emoji).toBe('👑')
  })
})

describe('getTrustFactor (log scale)', () => {
  it('سهل من 0-30 (×1.5)', () => {
    expect(getTrustFactor(10)).toBe(1.5)
    expect(getTrustFactor(29)).toBe(1.5)
  })
  it('عادي من 30-50 (×1.0)', () => {
    expect(getTrustFactor(30)).toBe(1.0)
    expect(getTrustFactor(49)).toBe(1.0)
  })
  it('متوسط من 50-70 (×0.7)', () => {
    expect(getTrustFactor(50)).toBe(0.7)
    expect(getTrustFactor(69)).toBe(0.7)
  })
  it('صعب من 70-85 (×0.4)', () => {
    expect(getTrustFactor(70)).toBe(0.4)
    expect(getTrustFactor(84)).toBe(0.4)
  })
  it('صعب جداً من 85-95 (×0.2)', () => {
    expect(getTrustFactor(85)).toBe(0.2)
    expect(getTrustFactor(94)).toBe(0.2)
  })
  it('أسطوري من 95-100 (×0.1)', () => {
    expect(getTrustFactor(95)).toBe(0.1)
    expect(getTrustFactor(100)).toBe(0.1)
  })
})

describe('effectiveDelta', () => {
  it('delta موجب بيتقلل مع الارتفاع', () => {
    expect(effectiveDelta(10, 10)).toBe(15) // 10 × 1.5
    expect(effectiveDelta(50, 10)).toBe(7) // 10 × 0.7
    expect(effectiveDelta(90, 10)).toBe(2) // 10 × 0.2
    expect(effectiveDelta(99, 10)).toBe(1) // 10 × 0.1
  })
  it('delta سالب بيتطبق كامل', () => {
    expect(effectiveDelta(50, -15)).toBe(-15)
    expect(effectiveDelta(90, -25)).toBe(-25)
  })
})

describe('trustProgress', () => {
  it('50 → باقي 50', () => {
    const p = trustProgress(50)
    expect(p.remaining).toBe(50)
    expect(p.percent).toBe(50)
  })
  it('clamp للقيم بره المدى', () => {
    expect(trustProgress(-10).score).toBe(0)
    expect(trustProgress(150).score).toBe(100)
  })
})

describe('الثوابت', () => {
  it('TRUST_MIN = 0', () => expect(TRUST_MIN).toBe(0))
  it('TRUST_MAX = 100', () => expect(TRUST_MAX).toBe(100))
  it('TRUST_DEFAULT = 50', () => expect(TRUST_DEFAULT).toBe(50))
})
