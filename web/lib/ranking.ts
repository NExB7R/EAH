import type { Business } from '@/lib/data'

// ═══════════════════════════════════════════════════════════
// EAH — Ranking
// ترتيب الأنشطة حسب التفاعل + الثقة + النشاط
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
// Trend Score — للترند
// ═══════════════════════════════════════════════════════════

export function trendScore(b: Business): number {
  const trust = b.trust_score / 100
  const orders = Math.log10(1 + b.successful_orders) / 2
  const recency = decay(daysSince(b.last_activity_at))
  const featuredBoost = b.is_featured ? 0.3 : 0
  const verifiedBoost = b.trust_tier === 'trusted' ? 0.15 : 0

  return trust * 0.4 + orders * 0.3 + recency * 0.3 + featuredBoost + verifiedBoost
}

// ═══════════════════════════════════════════════════════════
// Sorting helpers
// ═══════════════════════════════════════════════════════════

export function sortByTrend(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => trendScore(b) - trendScore(a))
}

export function sortByTrust(businesses: Business[]): Business[] {
  return [...businesses].sort((a, b) => b.trust_score - a.trust_score)
}

// ═══════════════════════════════════════════════════════════
// Roller — يعمل shuffle يومي مستقر
// ═══════════════════════════════════════════════════════════

// hash بسيط للـ seed
function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

// seed = التاريخ الحالي (YYYY-MM-DD)
function daySeed(): number {
  const d = new Date()
  return hash(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
}

// shuffle مستقر (نفس الترتيب في نفس اليوم)
export function dailyShuffle<T extends { id: string }>(items: T[]): T[] {
  const seed = daySeed()
  return [...items].sort((a, b) => {
    return (hash(a.id + seed) % 1000) - (hash(b.id + seed) % 1000)
  })
}
