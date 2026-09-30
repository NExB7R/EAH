// ═══════════════════════════════════════════════════════════
// EAH — Trust & Impact System
// ═══════════════════════════════════════════════════════════
// - Impact Score: 0-1000 (Reach + Influence + Trust + Consistency)
// - Impact Levels: visitor / basic / member / regular
// - Wanted Level: 0-5 (GTA Style)
// - Trust Decay: half-life 69 days (ScienceDirect 2026)
// ═══════════════════════════════════════════════════════════

// ─── ثوابت ───
export const IMPACT_MIN = 0
export const IMPACT_MAX = 1000
export const DECAY_HALF_LIFE_DAYS = 69
export const DECAY_FLOOR = 0.3
export const WANTED_MIN = 0
export const WANTED_MAX = 5

// ─── أوزان الأثر (4 مصادر) ───
export const IMPACT_WEIGHTS = {
  reach: 0.25,
  influence: 0.35,
  trust: 0.25,
  consistency: 0.15,
} as const

// ─── أهداف القياس (normalization targets) ───
export const IMPACT_TARGETS = {
  reach: 10_000, // 10K مشاهدة = 100
  influence: 500, // 500 تفاعل مؤثر = 100
  trust: 100, // 100 مستخدم فريد = 100
  consistency: 100, // 100 يوم streak = 100
} as const

// ─── المستويات ───
export const IMPACT_LEVELS = {
  visitor: { min: 0, max: 99, label: 'زائر' },
  basic: { min: 100, max: 399, label: 'أساسي' },
  member: { min: 400, max: 799, label: 'عضو' },
  regular: { min: 800, max: 1000, label: 'منتظم' },
} as const

export type ImpactLevel = keyof typeof IMPACT_LEVELS

// ─── أوزان التفاعل ───
export const ACTIVITY_WEIGHTS = {
  share: 25,
  reply: 15,
  comment: 10,
  follow: 8,
  favorite: 6,
  like: 1,
} as const

export type ActivityType = keyof typeof ACTIVITY_WEIGHTS

// ─── حدود التكرار (anti-spam) ───
export const RATE_LIMITS = {
  share: { max: 1, window: '24h', scope: 'business' },
  reply: { max: 5, window: '24h', scope: 'day' },
  comment: { max: 3, window: '24h', scope: 'business' },
  like: { max: 1, window: 'forever', scope: 'target' },
  follow: { max: 1, window: 'forever', scope: 'business' },
  favorite: { max: 1, window: 'forever', scope: 'business' },
} as const

// ─── Wanted Level Thresholds ───
export const WANTED_THRESHOLDS = [
  { min: 12, level: 5 },
  { min: 8, level: 4 },
  { min: 5, level: 3 },
  { min: 3, level: 2 },
  { min: 1, level: 1 },
] as const

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

export function clampImpact(score: number): number {
  return Math.max(IMPACT_MIN, Math.min(IMPACT_MAX, Math.round(score)))
}

export function getActivityWeight(type: ActivityType): number {
  return ACTIVITY_WEIGHTS[type]
}

export function getLevelLabel(level: ImpactLevel): string {
  return IMPACT_LEVELS[level].label
}

// ═══════════════════════════════════════════════════════════
// Impact Computation
// ═══════════════════════════════════════════════════════════

export type ImpactInputs = {
  reach: number
  influence: number
  trust: number
  consistency: number
}

// Log scale — يمنع التلاعب (CRI 2026)
function normalize(raw: number, target: number): number {
  if (raw <= 0) return 0
  const norm = Math.log10(raw + 1) / Math.log10(target + 1)
  return Math.min(100, norm * 100)
}

export function computeImpact(inputs: ImpactInputs): number {
  const reach = normalize(inputs.reach, IMPACT_TARGETS.reach)
  const influence = normalize(inputs.influence, IMPACT_TARGETS.influence)
  const trust = normalize(inputs.trust, IMPACT_TARGETS.trust)
  const consistency = normalize(inputs.consistency, IMPACT_TARGETS.consistency)

  const weighted =
    reach * IMPACT_WEIGHTS.reach +
    influence * IMPACT_WEIGHTS.influence +
    trust * IMPACT_WEIGHTS.trust +
    consistency * IMPACT_WEIGHTS.consistency

  return clampImpact(weighted * 10)
}

export function levelFromImpact(score: number): ImpactLevel {
  const s = clampImpact(score)
  if (s >= IMPACT_LEVELS.regular.min) return 'regular'
  if (s >= IMPACT_LEVELS.member.min) return 'member'
  if (s >= IMPACT_LEVELS.basic.min) return 'basic'
  return 'visitor'
}

// ═══════════════════════════════════════════════════════════
// Trust Decay
// ═══════════════════════════════════════════════════════════

export function applyDecay(score: number, daysInactive: number): number {
  if (daysInactive <= 0) return clampImpact(score)
  const factor = Math.pow(0.5, daysInactive / DECAY_HALF_LIFE_DAYS)
  const floored = Math.max(factor, DECAY_FLOOR)
  return clampImpact(score * floored)
}

// ═══════════════════════════════════════════════════════════
// Wanted Level
// ═══════════════════════════════════════════════════════════

export function computeWantedLevel(activeReports: number): number {
  for (const t of WANTED_THRESHOLDS) {
    if (activeReports >= t.min) return t.level
  }
  return 0
}

export function getWantedEmoji(level: number): string {
  if (level >= 5) return '💀'
  if (level === 0) return ''
  return '⭐'.repeat(level)
}

// ═══════════════════════════════════════════════════════════
// Impact Summary (للعرض)
// ═══════════════════════════════════════════════════════════

export type ImpactBreakdown = {
  score: number
  level: ImpactLevel
  levelLabel: string
  reach: number
  influence: number
  trust: number
  consistency: number
}

export function getImpactBreakdown(inputs: ImpactInputs): ImpactBreakdown {
  const score = computeImpact(inputs)
  const level = levelFromImpact(score)
  return {
    score,
    level,
    levelLabel: getLevelLabel(level),
    reach: Math.round(normalize(inputs.reach, IMPACT_TARGETS.reach)),
    influence: Math.round(normalize(inputs.influence, IMPACT_TARGETS.influence)),
    trust: Math.round(normalize(inputs.trust, IMPACT_TARGETS.trust)),
    consistency: Math.round(normalize(inputs.consistency, IMPACT_TARGETS.consistency)),
  }
}
