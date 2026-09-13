/**
 * EAH Smart Ranking System
 * -------------------------
 * ترتيب عادل وذكي يجمع بين:
 * - جودة المكان (تقييم + تقييمات)
 * - نشاطه الحالي (زوار + تعليقات)
 * - عروضه النشطة
 * - حداثته (لو جديد)
 * - العدالة (ما يظهرش نفس المكان دايماً)
 *
 * كل الأوزان ظاهرة وقابلة للتعديل من مكان واحد.
 */

export type RankingStats = {
  id: string
  slug: string

  /** 0-5 */
  rating: number
  /** إجمالي التقييمات */
  reviewCount: number
  /** زوار آخر 24 ساعة */
  recentViews: number
  /** تعليقات آخر 7 أيام */
  recentComments: number
  /** عروض نشطة (لا منتهية) */
  activeOffers: number
  /** كم يوم مر على إضافة المكان */
  ageInDays: number
  /** هل المكان "مميز" (مدفوع) */
  isFeatured: boolean

  /** آخر مرة ظهر فيها للمستخدم (timestamp) — تُحدَّث لاحقاً */
  lastShownAt?: number
  /** كم مرة ظهر في السلايدرات */
  totalImpressions?: number
}

/** ===== الأوزان — عدّلها من هنا فقط ===== */
export const RANKING_WEIGHTS = {
  rating:         0.30,  // التقييم — أهم معيار
  reviewCount:    0.12,  // عدد التقييمات (log scale)
  recentViews:    0.20,  // الزوار الحديثين
  recentComments: 0.10,  // التعليقات الحديثة
  activeOffers:   0.10,  // العروض النشطة
  freshness:      0.08,  // حداثة المكان
  fairness:       0.10,  // العدالة (ما يظهرش دايماً)
} as const

/** ===== المعايير الأخرى ===== */
export const RANKING_LIMITS = {
  /** أقصى boost للمميز (مدفوع) — ما يكسرش العدالة */
  maxFeaturedBoost: 0.15,
  /** الحد الأقصى لظهور المكان كـ "جديد" */
  newBusinessDays: 30,
  /** بعد كم ساعة ياخد المكان "بونص عدالة" كامل */
  fairnessFullHours: 24,
} as const

/* ===== Normalization helpers ===== */

/** Log scale — عشان الفرق بين 10 و100 تقييم يبان، لكن مش بشكل خطي */
function logNorm(value: number, max: number): number {
  if (value <= 0) return 0
  return Math.min(1, Math.log10(value + 1) / Math.log10(max + 1))
}

function linearNorm(value: number, max: number): number {
  if (value <= 0) return 0
  return Math.min(1, value / max)
}

/* ===== الحساب الرئيسي ===== */

export function calculateScore(s: RankingStats): number {
  // 1. التقييم (0-5 → 0-1)
  const ratingScore = s.rating / 5

  // 2. عدد التقييمات (log scale — 100 تقييم يستحق، 1000 أحسن بشكل طفيف)
  const reviewScore = logNorm(s.reviewCount, 1000)

  // 3. الزوار الحديثين (log scale — سقف 10K)
  const viewsScore = logNorm(s.recentViews, 10000)

  // 4. التعليقات الحديثة (log scale — سقف 200)
  const commentsScore = logNorm(s.recentComments, 200)

  // 5. العروض النشطة (خطي — سقف 5)
  const offersScore = linearNorm(s.activeOffers, 5)

  // 6. الحداثة — مكان جديد (< 30 يوم) ياخد boost بيقل تدريجياً
  let freshnessScore = 0
  if (s.ageInDays < RANKING_LIMITS.newBusinessDays) {
    freshnessScore = 1 - s.ageInDays / RANKING_LIMITS.newBusinessDays
  }

  // 7. العدالة — لو ظهر قريب، يقل.
  const hoursSinceShown = s.lastShownAt
    ? (Date.now() - s.lastShownAt) / (1000 * 60 * 60)
    : RANKING_LIMITS.fairnessFullHours
  const timeBonus = Math.min(1, hoursSinceShown / RANKING_LIMITS.fairnessFullHours)

  const impressionsPenalty = Math.min(1, (s.totalImpressions ?? 0) / 100)
  const fairnessScore = timeBonus * (1 - impressionsPenalty * 0.5)

  // ===== المجموع =====
  const baseScore =
    ratingScore   * RANKING_WEIGHTS.rating +
    reviewScore   * RANKING_WEIGHTS.reviewCount +
    viewsScore    * RANKING_WEIGHTS.recentViews +
    commentsScore * RANKING_WEIGHTS.recentComments +
    offersScore   * RANKING_WEIGHTS.activeOffers +
    freshnessScore * RANKING_WEIGHTS.freshness +
    fairnessScore  * RANKING_WEIGHTS.fairness

  return baseScore
}

/* ===== الترتيب النهائي ===== */

export type RankedItem<T> = T & {
  score: number
  rank: number
  reason: string  // سبب ظهوره (للشفافية)
}

export function rankBusinesses<T extends RankingStats>(
  items: T[],
  options: { includeFeaturedBoost?: boolean } = {}
): RankedItem<T>[] {
  const scored = items.map((item) => {
    let score = calculateScore(item)

    // boost المميز (محدود جداً — لا يكسر العدالة)
    if (options.includeFeaturedBoost && item.isFeatured) {
      score += RANKING_LIMITS.maxFeaturedBoost
    }

    // سبب الظهور (شفافية للمستخدم)
    let reason = 'مختار لك'
    if (item.isFeatured) reason = 'مميز'
    else if (item.ageInDays < RANKING_LIMITS.newBusinessDays) reason = 'جديد'
    else if (item.activeOffers > 0) reason = 'عروض نشطة'
    else if (item.recentViews > 100) reason = 'ترند'
    else if (item.rating >= 4.5 && item.reviewCount >= 20) reason = 'الأعلى تقييماً'

    return {
      ...item,
      score,
      rank: 0,
      reason,
    }
  })

  scored.sort((a, b) => b.score - a.score)
  scored.forEach((item, i) => {
    item.rank = i + 1
  })

  return scored
}

/* ===== Diversity Pass — منع نفس الفئة مرتين ورا بعض ===== */

export function diversifyByCategory<T extends { business_type?: string; type?: string }>(
  items: T[],
  categoryKey: 'business_type' | 'type' = 'type'
): T[] {
  const result: T[] = []
  const pool = [...items]
  let lastCategory = ''

  while (pool.length > 0) {
    // دوّر على أول عنصر مختلف عن السابق
    const idx = pool.findIndex((item) => {
      const cat = (item as any)[categoryKey]
      return cat && cat !== lastCategory
    })

    const pick = idx >= 0 ? pool.splice(idx, 1)[0] : pool.shift()!
    const cat = (pick as any)[categoryKey] ?? ''
    result.push(pick)
    lastCategory = cat
  }

  return result
}
