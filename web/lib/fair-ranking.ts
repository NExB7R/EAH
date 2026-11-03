// ═══════════════════════════════════════════════════════════
// EAH — Fair Ranking Engine (2026)
// نظام موحّد: Relevance + Quality + Freshness + Fairness
// + Diversity constraint (max N per type in top window)
// + Cold-start boost
// ═══════════════════════════════════════════════════════════

import type { Business, Offer } from '@/lib/data/businesses'
import { trendScore } from '@/lib/ranking'
import { getBusinessReputationScore } from '@/lib/reputation'

export type FairWeights = {
  quality: number
  freshness: number
  fairness: number
  relevance: number
}

export const WEIGHTS: Record<string, FairWeights> = {
  featured: { quality: 0.5, freshness: 0.2, fairness: 0.25, relevance: 0.05 },
  trending: { quality: 0.45, freshness: 0.15, fairness: 0.25, relevance: 0.15 },
  offers: { quality: 0.3, freshness: 0.4, fairness: 0.25, relevance: 0.05 },
  new: { quality: 0.2, freshness: 0.7, fairness: 0.1, relevance: 0 },
  nearby: { quality: 0.3, freshness: 0.1, fairness: 0.2, relevance: 0.4 },
  suggest: { quality: 0.3, freshness: 0.1, fairness: 0.25, relevance: 0.35 },
}

function qualityScore(b: Business): number {
  return getBusinessReputationScore(b) / 100
}

function freshnessScore(b: Business): number {
  const updated = b.updated_at ? new Date(b.updated_at).getTime() : 0
  if (!updated) return 0
  const days = (Date.now() - updated) / 86400000
  return Math.max(0.2, 1 - days / 60)
}

function relevanceScore(b: Business, ctx: { type?: string; area?: string }): number {
  let score = 0.5
  if (ctx.type && b.business_type === ctx.type) score += 0.3
  if (ctx.area && b.area === ctx.area) score += 0.2
  return Math.min(1, score)
}

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function daySeed(): number {
  const d = new Date()
  return hash(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
}

function fairnessBoost(id: string, seed: number): number {
  return (hash(id + seed) % 1000) / 1000
}

function coldStartBoost(b: Business): number {
  if (!b.is_new_project || !b.new_until) return 0
  const now = Date.now()
  const created = new Date(b.created_at).getTime()
  const expires = new Date(b.new_until).getTime()
  if (!Number.isFinite(created) || !Number.isFinite(expires) || expires <= now) return 0
  const days = Math.max(0, (now - created) / 86400000)
  if (days > 30) return 0
  return 0.3 * (1 - days / 30)
}

export function fairScore(
  b: Business,
  section: keyof typeof WEIGHTS,
  ctx: { type?: string; area?: string } = {},
  seed?: number,
): number {
  const w = WEIGHTS[section] ?? WEIGHTS.trending!
  const s = seed ?? daySeed()

  const quality = qualityScore(b)
  const freshness = freshnessScore(b)
  const relevance = relevanceScore(b, ctx)
  const fairness = fairnessBoost(b.id, s)
  const cold = coldStartBoost(b)

  return (
    quality * w.quality +
    freshness * w.freshness +
    relevance * w.relevance +
    fairness * w.fairness +
    cold
  )
}

function applyDiversity(sorted: Business[], topWindow = 8, maxPerType = 2): Business[] {
  const result: Business[] = []
  const typeCount = new Map<string, number>()
  const deferred: Business[] = []

  for (const b of sorted) {
    if (result.length >= topWindow) {
      deferred.push(b)
      continue
    }
    const count = typeCount.get(b.business_type) ?? 0
    if (count >= maxPerType) {
      deferred.push(b)
      continue
    }
    result.push(b)
    typeCount.set(b.business_type, count + 1)
  }

  return [...result, ...deferred]
}

export function fairOrder(
  businesses: Business[],
  section: keyof typeof WEIGHTS,
  ctx: { type?: string; area?: string } = {},
  options: { topWindow?: number; maxPerType?: number } = {},
): Business[] {
  const seed = daySeed()
  const scored = businesses.map((b) => ({
    b,
    score: fairScore(b, section, ctx, seed),
  }))
  scored.sort((a, b) => b.score - a.score)
  const sorted = scored.map((x) => x.b)
  return applyDiversity(sorted, options.topWindow ?? 8, options.maxPerType ?? 2)
}

export function fairOrderOffers(
  offers: Offer[],
  limit = 20,
  trendingBusinesses: Business[] = [],
): Offer[] {
  if (offers.length === 0 || limit <= 0) return []

  const scoreByBusiness = new Map(
    trendingBusinesses.map((business) => [business.id, business.trend_score ?? trendScore(business)]),
  )
  const scored = offers.map((offer) => {
    const businessId = offer.business?.id
    const activity = businessId ? scoreByBusiness.get(businessId) ?? 0 : 0
    return { offer, activity }
  })

  scored.sort((a, b) => b.activity - a.activity)

  // The activity score sets each tier. Only close scores are shuffled,
  // so more-active businesses remain ahead without a permanent fixed position.
  const mixed: Offer[] = []
  for (let index = 0; index < scored.length;) {
    const anchor = scored[index]!.activity
    let end = index + 1
    while (end < scored.length && anchor - scored[end]!.activity <= 0.025) end++

    const band = scored.slice(index, end).map((item) => item.offer)
    const seed = daySeed()
    for (let i = band.length - 1; i > 0; i--) {
      const j = hash(`${band[i]!.id}:${seed}:${i}`) % (i + 1)
      ;[band[i], band[j]] = [band[j]!, band[i]!]
    }
    mixed.push(...band)
    index = end
  }

  // Different businesses get the first exposure slots before duplicate offers.
  return dedupeOffersByBiz(mixed, Math.min(8, limit)).slice(0, limit)
}

function dedupeOffersByBiz(offers: Offer[], firstWindow: number): Offer[] {
  const seen = new Set<string>()
  const result: Offer[] = []
  const deferred: Offer[] = []

  for (const o of offers) {
    const bizId = o.business?.id ?? o.id
    if (result.length < firstWindow) {
      if (seen.has(bizId)) {
        deferred.push(o)
        continue
      }
      seen.add(bizId)
      result.push(o)
    } else {
      result.push(o)
    }
  }

  return [...result, ...deferred]
}
