// ═══════════════════════════════════════════════════════════
// EAH — Participation Points (2026-10-06). This is gamification, not reliability.
// ═══════════════════════════════════════════════════════════
// 5 مستويات شعبية مصري:
//   bade2 (0-19)  → بداية
//   mashey (20-39) → مشارك
//   fel (40-59) → نشط
//   harif (60-79) → متميز
//   ostora (80-100) → أسطورة
//
// Log scale: الصعوبة بتزيد كل ما تقرب من 100
// Legend Points: بتتحسب بعد ما توصل 100 — للترتيب الداخلي
// ═══════════════════════════════════════════════════════════

// ─── ثوابت ───
export const TRUST_MIN = 0
export const TRUST_MAX = 100
export const TRUST_DEFAULT = 50

// ─── 5 مستويات ───
export const TRUST_TIERS = {
  bade2: { min: 0, max: 19, label: 'بداية', emoji: '🌱', color: '#7B7490' },
  mashey: { min: 20, max: 39, label: 'مشارك', emoji: '🌿', color: '#55E7D1' },
  fel: { min: 40, max: 59, label: 'نشط', emoji: '🌳', color: '#A855F7' },
  harif: { min: 60, max: 79, label: 'متميز', emoji: '🏆', color: '#E8C79A' },
  ostora: { min: 80, max: 100, label: 'الأسطورة', emoji: '👑', color: '#F5D9A7' },
} as const

export type TrustTier = keyof typeof TRUST_TIERS

export const TRUST_TIER_ORDER: TrustTier[] = ['bade2', 'mashey', 'fel', 'harif', 'ostora']

// ─── Log scale factors (نفس اللي في DB) ───
export const TRUST_FACTORS = [
  { max: 30, factor: 1.5, label: 'سهل' },
  { max: 50, factor: 1.0, label: 'عادي' },
  { max: 70, factor: 0.7, label: 'متوسط' },
  { max: 85, factor: 0.4, label: 'صعب' },
  { max: 95, factor: 0.2, label: 'صعب جداً' },
  { max: 100, factor: 0.1, label: 'أسطوري' },
] as const

// ─── الأحداث ───
export const TRUST_EVENTS = {
  // كسب
  review_approved: { delta: 5, label: 'تقييم معتمد', icon: '✍️' },
  review_received: { delta: 3, label: 'نشاطك أخد تقييم', icon: '⭐' },
  order_completed: { delta: 8, label: 'طلب مكتمل', icon: '🛒' },
  referral_signup: { delta: 5, label: 'صاحب سجّل بكودك', icon: '👥' },
  referral_first_order: { delta: 15, label: 'صاحبك عمل أول طلب', icon: '🎉' },
  daily_login: { delta: 1, label: 'تسجيل دخول يومي', icon: '📅' },
  profile_completed: { delta: 3, label: 'أكملت بياناتك', icon: '✅' },
  // خصم
  review_rejected: { delta: -15, label: 'تقييم مرفوض', icon: '❌' },
  report_valid: { delta: -25, label: 'بلاغ صحيح', icon: '🚨' },
  order_cancelled: { delta: -5, label: 'طلب ملغي', icon: '❌' },
  order_rejected: { delta: -3, label: 'طلب مرفوض', icon: '⚠️' },
  decay: { delta: -1, label: 'خمول طويل', icon: '💤' },
} as const

export type TrustEventType = keyof typeof TRUST_EVENTS

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════

export function getTrustTier(score: number): TrustTier {
  const s = Math.max(TRUST_MIN, Math.min(TRUST_MAX, Math.round(score)))
  if (s < 20) return 'bade2'
  if (s < 40) return 'mashey'
  if (s < 60) return 'fel'
  if (s < 80) return 'harif'
  return 'ostora'
}

export function getTrustTierMeta(score: number) {
  return TRUST_TIERS[getTrustTier(score)]
}

export function getTrustFactor(score: number): number {
  const s = Math.max(TRUST_MIN, Math.min(TRUST_MAX, score))
  for (const f of TRUST_FACTORS) {
    if (s < f.max) return f.factor
  }
  return 0.1
}

// يحسب delta الفعلي بعد الـ scale
export function effectiveDelta(currentScore: number, rawDelta: number): number {
  if (rawDelta <= 0) return rawDelta
  return Math.round(rawDelta * getTrustFactor(currentScore))
}

// المسافة للـ 100
export function trustProgress(score: number) {
  const s = Math.max(0, Math.min(100, score))
  return {
    score: s,
    remaining: 100 - s,
    percent: s,
  }
}

// ─── أوزان التفاعل (للتقييم العام للأثر) ───
export const ACTIVITY_WEIGHTS = {
  share: 25,
  reply: 15,
  comment: 10,
  follow: 8,
  favorite: 6,
  like: 1,
} as const

export type ActivityType = keyof typeof ACTIVITY_WEIGHTS

// ─── Rate limits ───
export const RATE_LIMITS = {
  share: { max: 1, window: '24h', scope: 'business' },
  reply: { max: 5, window: '24h', scope: 'day' },
  comment: { max: 3, window: '24h', scope: 'business' },
  like: { max: 1, window: 'forever', scope: 'target' },
  follow: { max: 1, window: 'forever', scope: 'business' },
  favorite: { max: 1, window: 'forever', scope: 'business' },
} as const
