import { describe, it, expect } from 'vitest'
import {
  computeImpact,
  levelFromImpact,
  applyDecay,
  computeWantedLevel,
  clampImpact,
  getActivityWeight,
  getWantedEmoji,
  getImpactBreakdown,
  IMPACT_MIN,
  IMPACT_MAX,
  DECAY_HALF_LIFE_DAYS,
} from './trust'

describe('clampImpact', () => {
  it('بيمنع القيم السالبة', () => {
    expect(clampImpact(-100)).toBe(IMPACT_MIN)
  })
  it('بيمنع القيم > 1000', () => {
    expect(clampImpact(5000)).toBe(IMPACT_MAX)
  })
  it('بيقرّب الأرقام العشرية', () => {
    expect(clampImpact(456.7)).toBe(457)
  })
})

describe('computeImpact', () => {
  it('بيرجع 0 لو كل المدخلات صفر', () => {
    const result = computeImpact({ reach: 0, influence: 0, trust: 0, consistency: 0 })
    expect(result).toBe(0)
  })

  it('بيرجع قيمة عالية لو كل المدخلات في الحد الأقصى', () => {
    const result = computeImpact({
      reach: 10000,
      influence: 500,
      trust: 100,
      consistency: 100,
    })
    expect(result).toBeGreaterThan(800)
    expect(result).toBeLessThanOrEqual(IMPACT_MAX)
  })

  it('الـ influence له وزن أكبر من الـ reach', () => {
    const reachOnly = computeImpact({ reach: 5000, influence: 0, trust: 0, consistency: 0 })
    const influenceOnly = computeImpact({ reach: 0, influence: 250, trust: 0, consistency: 0 })
    expect(influenceOnly).toBeGreaterThan(reachOnly)
  })

  it('بيستخدم log scale — الزيادة الأولى أكبر من التالية', () => {
    const step1 = computeImpact({ reach: 100, influence: 0, trust: 0, consistency: 0 })
    const step2 = computeImpact({ reach: 200, influence: 0, trust: 0, consistency: 0 })
    const step3 = computeImpact({ reach: 300, influence: 0, trust: 0, consistency: 0 })

    const diff1 = step2 - step1
    const diff2 = step3 - step2
    expect(diff1).toBeGreaterThan(diff2)
  })
})

describe('levelFromImpact', () => {
  it('visitor للقيم أقل من 100', () => {
    expect(levelFromImpact(0)).toBe('visitor')
    expect(levelFromImpact(50)).toBe('visitor')
    expect(levelFromImpact(99)).toBe('visitor')
  })

  it('basic من 100 لـ 399', () => {
    expect(levelFromImpact(100)).toBe('basic')
    expect(levelFromImpact(399)).toBe('basic')
  })

  it('member من 400 لـ 799', () => {
    expect(levelFromImpact(400)).toBe('member')
    expect(levelFromImpact(799)).toBe('member')
  })

  it('regular من 800 لـ 1000', () => {
    expect(levelFromImpact(800)).toBe('regular')
    expect(levelFromImpact(1000)).toBe('regular')
  })
})

describe('applyDecay', () => {
  it('مفيش تغيير لو مفيش خمول', () => {
    expect(applyDecay(500, 0)).toBe(500)
  })

  it('بينزل للنص بعد DECAY_HALF_LIFE_DAYS', () => {
    const result = applyDecay(500, DECAY_HALF_LIFE_DAYS)
    expect(result).toBe(250)
  })

  it('بيوقف عند DECAY_FLOOR (30%) — مش بينزل أقل', () => {
    // بعد 138 يوم (2× half-life) — القيمة النظرية 125، بس floor بيمنع
    const at2x = applyDecay(500, DECAY_HALF_LIFE_DAYS * 2)
    expect(at2x).toBe(150) // 500 × 0.3 (floor)
  })

  it('القيمة بتفضل عند الـ floor مهما طال الخمول', () => {
    const at10x = applyDecay(500, DECAY_HALF_LIFE_DAYS * 10)
    expect(at10x).toBe(150)
  })
})

describe('computeWantedLevel', () => {
  it('0 لو مفيش بلاغات', () => {
    expect(computeWantedLevel(0)).toBe(0)
  })

  it('1 نجمة لبلاغ واحد', () => {
    expect(computeWantedLevel(1)).toBe(1)
  })

  it('2 نجوم لـ 3 بلاغات', () => {
    expect(computeWantedLevel(3)).toBe(2)
  })

  it('5 نجوم لـ 12+ بلاغ', () => {
    expect(computeWantedLevel(12)).toBe(5)
    expect(computeWantedLevel(100)).toBe(5)
  })
})

describe('getActivityWeight', () => {
  it('مشاركة = 25', () => {
    expect(getActivityWeight('share')).toBe(25)
  })
  it('رد = 15', () => {
    expect(getActivityWeight('reply')).toBe(15)
  })
  it('تعليق = 10', () => {
    expect(getActivityWeight('comment')).toBe(10)
  })
  it('متابعة = 8', () => {
    expect(getActivityWeight('follow')).toBe(8)
  })
  it('مفضلة = 6', () => {
    expect(getActivityWeight('favorite')).toBe(6)
  })
  it('لايك = 1', () => {
    expect(getActivityWeight('like')).toBe(1)
  })
})

describe('getWantedEmoji', () => {
  it('فاضي لو 0', () => {
    expect(getWantedEmoji(0)).toBe('')
  })
  it('نجمة لـ 1', () => {
    expect(getWantedEmoji(1)).toBe('⭐')
  })
  it('5 نجوم لـ 5+', () => {
    expect(getWantedEmoji(5)).toContain('💀')
    expect(getWantedEmoji(10)).toContain('💀')
  })
})

describe('getImpactBreakdown', () => {
  it('بيرجع breakdown كامل', () => {
    const result = getImpactBreakdown({
      reach: 5000,
      influence: 100,
      trust: 50,
      consistency: 30,
    })
    expect(result).toHaveProperty('score')
    expect(result).toHaveProperty('level')
    expect(result).toHaveProperty('levelLabel')
    expect(result).toHaveProperty('reach')
    expect(result).toHaveProperty('influence')
    expect(result).toHaveProperty('trust')
    expect(result).toHaveProperty('consistency')
  })

  it('القيم العادية تكون بين 0 و 100', () => {
    const result = getImpactBreakdown({
      reach: 5000,
      influence: 100,
      trust: 50,
      consistency: 30,
    })
    expect(result.reach).toBeGreaterThanOrEqual(0)
    expect(result.reach).toBeLessThanOrEqual(100)
    expect(result.influence).toBeGreaterThanOrEqual(0)
    expect(result.influence).toBeLessThanOrEqual(100)
  })
})
