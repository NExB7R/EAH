import type { Business } from '@/lib/data'
import { getBusinessReputationScore } from '@/lib/reputation'

// ═══════════════════════════════════════════════════════════
// EAH — Trend Score (2026) — 7 معايير
// CRITERIA §2
// ═══════════════════════════════════════════════════════════

const DAY_MS = 24 * 60 * 60 * 1000

function unitSignal(value: unknown, fallback = 0): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) {
    return fallback
  }
  return value
}

function scaledSignal(value: unknown, scale: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || scale <= 0) return 0
  return Math.min(1, Math.max(0, value / scale))
}

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
  // All seven inputs are normalized to [0, 1] before applying their weights.
  // 1) Velocity (25%) — نشاط الأسبوع الأخير
  const velocity = scaledSignal(b.velocity_score, 50)

  // 2) Evidence-based public business reputation (20%); participation points are excluded.
  const reputation = unitSignal(getBusinessReputationScore(b) / 100)

  // 3) Recency (15%) — آخر نشاط
  const recency = unitSignal(decay(daysSince(b.last_activity_at)))

  // 4) Diversity (15%) — عدد المستخدمين الفريدين
  const diversity = scaledSignal(b.diversity_score, 50)

  // 5) Quality (10%) — التقييم
  const quality = b.rating_count > 0 ? unitSignal((b.rating_avg ?? 0) / 5, 0.5) : 0.5

  // 6) Engagement (10%) — تفاعل 30 يوم
  const engagement = scaledSignal(b.engagement_score, 100)

  // 7) Response Rate (5%) — contract: a fraction in [0, 1].
  // The production column currently has default zeros and no application writer;
  // missing, malformed or differently-scaled values stay neutral until its data source is defined.
  const response = unitSignal(b.response_rate, 0.5)

  return (
    velocity * 0.25 +
    reputation * 0.2 +
    recency * 0.15 +
    diversity * 0.15 +
    quality * 0.1 +
    engagement * 0.1 +
    response * 0.05
  )
}

export function sortByTrend(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => trendScore(b) - trendScore(a))
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
