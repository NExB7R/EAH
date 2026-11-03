// ═══════════════════════════════════════════════════════════
// EAH — Fair Ranking Engine (2026)
// نظام موحّد: Relevance + Quality + Freshness + Fairness
// + Diversity constraint (max N per type in top window)
// + Cold-start boost
// ═══════════════════════════════════════════════════════════

import type { Business, Offer } from '@/lib/data/businesses'
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
  if (!b.is_new_project) return 0
  const created = new Date(b.created_at).getTime()
  if (!created) return 0
  const days = (Date.now() - created) / 86400000
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

export function fairOrderOffers(offers: Offer[], limit = 20): Offer[] {
  if (offers.length === 0 || limit <= 0) return []

  const seed = daySeed()
  const scored = offers.map((offer) => {
    const business = offer.business
    const velocity = Math.min(1, Math.max(0, Number(business?.velocity_score ?? 0)) / 50)
    const engagement = Math.min(1, Math.max(0, Number(business?.engagement_score ?? 0)) / 100)
    const diversity = Math.min(1, Math.max(0, Number(business?.diversity_score ?? 0)) / 50)
    const lastActivity = business?.last_activity_at ? new Date(business.last_activity_at).getTime() : 0
    const daysSinceActivity = lastActivity > 0 ? Math.max(0, (Date.now() - lastActivity) / 86400000) : 90
    const recency = 1 / (1 + daysSinceActivity / 14)
    const reputation = business ? getBusinessReputationScore(business) / 100 : 0
    const offerAge = offer.created_at ? Math.max(0, (Date.now() - new Date(offer.created_at).getTime()) / 86400000) : 90
    const offerFreshness = 1 / (1 + offerAge / 30)

    // Activity leads. Freshness and reputation refine close candidates but never
    // let a new offer from a dormant business outrank a genuinely active one.
    const activity = velocity * 0.4 + engagement * 0.3 + diversity * 0.1 + recency * 0.2
    const score = activity * 0.8 + offerFreshness * 0.12 + reputation * 0.08
    return { offer, score, activity }
  })

  scored.sort((a, b) => b.score - a.score)

  // Randomize only within near-equal activity bands. Higher-activity bands remain
  // ahead, while similarly active businesses share exposure without fixed positions.
  const mixed: typeof scored = []
  for (let index = 0; index < scored.length;) {
    const anchor = scored[index]!.activity
    let end = index + 1
    while (end < scored.length && anchor - scored[end]!.activity <= 0.04) end++
    const band = scored.slice(index, end)
    for (let i = band.length - 1; i > 0; i--) {
      const j = hash(`${band[i]!.offer.id}:${seed}:${i}`) % (i + 1)
      ;[band[i], band[j]] = [band[j]!, band[i]!]
    }
    mixed.push(...band)
    index = end
  }

  return dedupeOffersByBiz(mixed.map((item) => item.offer), Math.min(8, limit)).slice(0, limit)
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
