import { describe, it, expect } from 'vitest'
import { trendScore, sortByTrend, sortByTrust, dailyShuffle } from './ranking'
import type { Business } from '@/lib/data'

function makeBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: 'b1',
    slug: 'b1',
    name: 'Test',
    owner_profile_id: 'p1',
    business_type: 'restaurant',
    description: null,
    hook: null,
    area: null,
    city: null,
    address_text: null,
    map_url: null,
    cover_image_url: null,
    is_open: true,
    is_featured: false,
    is_new_project: false,
    is_opportunity: false,
    opportunity_until: null,
    opportunity_note: null,
    trust_score: 50,
    trust_tier: 'trusted',
    successful_orders: 0,
    featured_order: 0,
    featured_until: null,
    featured_pin: false,
    new_until: null,
    working_hours: null,
    accepts_whatsapp_orders: false,
    response_time_avg_seconds: null,
    ...overrides,
  } as Business
}

describe('trendScore', () => {
  it('بيرجع قيمة بين 0 و 2 للحالات العادية', () => {
    const b = makeBusiness({ trust_score: 50, successful_orders: 10 })
    const score = trendScore(b)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(2)
  })

  it('ثقة أعلى = score أعلى', () => {
    const low = makeBusiness({ trust_score: 20 })
    const high = makeBusiness({ trust_score: 90 })
    expect(trendScore(high)).toBeGreaterThan(trendScore(low))
  })

  it('velocity أعلى = score أعلى', () => {
    const low = makeBusiness({ velocity_score: 5 })
    const high = makeBusiness({ velocity_score: 40 })
    expect(trendScore(high)).toBeGreaterThan(trendScore(low))
  })

  it('engagement أعلى = score أعلى', () => {
    const low = makeBusiness({ engagement_score: 10 })
    const high = makeBusiness({ engagement_score: 90 })
    expect(trendScore(high)).toBeGreaterThan(trendScore(low))
  })

  it('diversity أعلى = score أعلى', () => {
    const low = makeBusiness({ diversity_score: 5 })
    const high = makeBusiness({ diversity_score: 45 })
    expect(trendScore(high)).toBeGreaterThan(trendScore(low))
  })
})

describe('sortByTrend', () => {
  it('بيرتب تنازلياً حسب trendScore', () => {
    const a = makeBusiness({ id: 'a', trust_score: 30 })
    const b = makeBusiness({ id: 'b', trust_score: 80 })
    const c = makeBusiness({ id: 'c', trust_score: 60 })
    const sorted = sortByTrend([a, b, c])
    expect(sorted[0]?.id).toBe('b')
    expect(sorted[1]?.id).toBe('c')
    expect(sorted[2]?.id).toBe('a')
  })

  it('مش بيعدّل المصفوفة الأصلية', () => {
    const a = makeBusiness({ id: 'a', trust_score: 30 })
    const b = makeBusiness({ id: 'b', trust_score: 80 })
    const original = [a, b]
    sortByTrend(original)
    expect(original[0]?.id).toBe('a')
  })
})

describe('sortByTrust', () => {
  it('بيرتب حسب trust_score', () => {
    const a = makeBusiness({ id: 'a', trust_score: 20 })
    const b = makeBusiness({ id: 'b', trust_score: 90 })
    const c = makeBusiness({ id: 'c', trust_score: 50 })
    const sorted = sortByTrust([a, b, c])
    expect(sorted.map((x) => x.id)).toEqual(['b', 'c', 'a'])
  })
})

describe('dailyShuffle', () => {
  it('بيرجع كل العناصر (مش بيفقد حد)', () => {
    const items = [
      makeBusiness({ id: 'a' }),
      makeBusiness({ id: 'b' }),
      makeBusiness({ id: 'c' }),
      makeBusiness({ id: 'd' }),
    ]
    const shuffled = dailyShuffle(items)
    expect(shuffled).toHaveLength(4)
    expect(new Set(shuffled.map((x) => x.id)).size).toBe(4)
  })

  it('مستقر في نفس اليوم (نفس الترتيب)', () => {
    const items = [makeBusiness({ id: 'a' }), makeBusiness({ id: 'b' }), makeBusiness({ id: 'c' })]
    const s1 = dailyShuffle(items)
    const s2 = dailyShuffle(items)
    expect(s1.map((x) => x.id)).toEqual(s2.map((x) => x.id))
  })

  it('مش بيعدّل المصفوفة الأصلية', () => {
    const items = [makeBusiness({ id: 'a' }), makeBusiness({ id: 'b' })]
    const original = [...items]
    dailyShuffle(items)
    expect(items[0]?.id).toBe(original[0]?.id)
  })
})
