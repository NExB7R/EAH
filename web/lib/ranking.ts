import type { Business } from '@/lib/data'
import { getBusinessReputationScore } from '@/lib/reputation'

// ═══════════════════════════════════════════════════════════
// EAH — Trend Score (2026) — 7 معايير
// CRITERIA §2
// ═══════════════════════════════════════════════════════════

const DAY_MS = 24 * 60 * 60 * 1000

// كم يوم من آخر نشاط؟
function daysSince(iso: string | null): number {
  if (!iso) return 365
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 365
  return Math.max(0, (Date.now() - t) / DAY_MS)
}

// decay: 1.0 → 0.5 بعد 30 يوم
function decay(days: number): number {
  return 1 / (1 + days / 30)
}

// ═══════════════════════════════════════════════════════════
// Trend Score — 7 معايير (CRITERIA §2)
// ═══════════════════════════════════════════════════════════
export function trendScore(b: Business): number {
  const velocity = Math.max(0, Math.min(1, (b.velocity_score ?? 0) / 50))
  const engagement = Math.max(0, Math.min(1, (b.engagement_score ?? 0) / 100))
  const diversity = Math.max(0, Math.min(1, (b.diversity_score ?? 0) / 50))
  const recency = b.last_activity_at ? decay(daysSince(b.last_activity_at)) : 0
  // Use customer-rated quality only. Admin-set verification is a public trust
  // badge, not an admin-controlled trend-ranking boost.
  const ratingCount = Math.max(0, Math.floor(b.rating_count ?? 0))
  const ratingAverage = Math.max(0, Math.min(5, b.rating_avg ?? 0))
  const ratingConfidence = ratingCount / (ratingCount + 5)
  const quality = (ratingAverage / 5) * ratingConfidence
  const conversion =
    0.7 * (1 - Math.exp(-Math.max(0, b.trend_recent_orders ?? 0) / 3)) +
    0.3 * (1 - Math.exp(-Math.max(0, b.trend_recent_reviews ?? 0) / 3))

  // Recent, unique, intentional customer actions lead. No paid Featured flag,
  // admin pin/order, participation points, raw impressions or follower totals.
  return (
    velocity * 0.3 +
    engagement * 0.2 +
    diversity * 0.15 +
    recency * 0.15 +
    quality * 0.1 +
    conversion * 0.1
  )
}

export function sortByTrend(businesses: Business[]): Business[] {
  const scored = [...businesses]
    .map((business) => ({ business, score: trendScore(business) }))
    .sort((a, b) => b.score - a.score || a.business.id.localeCompare(b.business.id))

  // Randomize only near-ties; a clearly stronger activity remains ahead.
  const scoreMixed: typeof scored = []
  for (let index = 0; index < scored.length;) {
    const anchor = scored[index]!.score
    let end = index + 1
    while (end < scored.length && anchor - scored[end]!.score <= 0.015) end++
    const band = dailyShuffle(scored.slice(index, end).map((entry) => entry.business))
    const scoreById = new Map(scored.slice(index, end).map((entry) => [entry.business.id, entry.score]))
    scoreMixed.push(...band.map((business) => ({ business, score: scoreById.get(business.id) ?? anchor })))
    index = end
  }

  // Prevent the top window from being filled by one category, while retaining
  // the exact score order for deferred entries after the diverse first window.
  const result: Business[] = []
  const deferred: Business[] = []
  const typeCounts = new Map<string, number>()
  for (const { business } of scoreMixed) {
    if (result.length >= 10) {
      deferred.push(business)
      continue
    }
    const count = typeCounts.get(business.business_type) ?? 0
    if (count >= 3) {
      deferred.push(business)
      continue
    }
    result.push(business)
    typeCounts.set(business.business_type, count + 1)
  }
  return [...result, ...deferred]
}

/** Backward-compatible name; orders by evidence-based business reputation. */
export function sortByTrust(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => getBusinessReputationScore(b) - getBusinessReputationScore(a))
}

// ═══════════════════════════════════════════════════════════
// Daily shuffle (deterministic per-day)
// ═══════════════════════════════════════════════════════════

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

export function dailyShuffle<T extends { id: string }>(items: T[]): T[] {
  const seed = daySeed()
  return [...items].sort((a, b) => {
    return (hash(a.id + seed) % 1000) - (hash(b.id + seed) % 1000)
  })
}
