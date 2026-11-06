import type { BusinessMetrics, ComparisonData } from '@/lib/data/insights'

// ═══════════════════════════════════════════════════════════
// EAH — AI Business Advisor (Analysis Engine)
// ═══════════════════════════════════════════════════════════

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'success'

export type Insight = {
  id: string
  severity: InsightSeverity
  title: string
  description: string
  action?: string
}

export type AnalysisResult = {
  score: number
  scoreLabel: string
  scoreTone: 'red' | 'orange' | 'gold' | 'teal'
  summary: string
  insights: Insight[]
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  comparison: {
    rating: { self: number; category: number; delta: number } | null
  }
  trends: {
    viewsTrend: 'up' | 'down' | 'flat'
    ordersTrend: 'up' | 'down' | 'flat'
    ratingTrend: 'up' | 'down' | 'flat'
  }
}

export function analyzeBusiness(
  metrics: BusinessMetrics,
  comparison: ComparisonData | null,
): AnalysisResult {
  const insights: Insight[] = []
  const strengths: string[] = []
  const weaknesses: string[] = []
  const opportunities: string[] = []

  let score = 0

  // اكتمال (20)
  let completeness = 0
  if (metrics.hasWhatsapp) completeness += 5
  if (metrics.hasMenu) completeness += 5
  if (metrics.mediaCount >= 3) completeness += 5
  if (metrics.isVerified) completeness += 5
  score += completeness

  // التقييمات (30)
  let ratingScore = 0
  if (metrics.reviewsTotal >= 5) {
    ratingScore = Math.round((metrics.avgRating / 5) * 30)
    if (metrics.avgRating >= 4.5) ratingScore = 30
  } else if (metrics.reviewsTotal > 0) {
    ratingScore = Math.round((metrics.avgRating / 5) * 18)
  }
  score += ratingScore

  // الطلبات (25)
  let orderScore = 0
  if (metrics.ordersTotal > 0) {
    const rate = metrics.ordersConfirmed / metrics.ordersTotal
    orderScore = Math.round(rate * 25)
  }
  score += orderScore

  // سرعة الرد (15)
  let responseScore = 0
  if (metrics.avgResponseTimeMin !== null) {
    if (metrics.avgResponseTimeMin <= 5) responseScore = 15
    else if (metrics.avgResponseTimeMin <= 15) responseScore = 12
    else if (metrics.avgResponseTimeMin <= 60) responseScore = 8
    else responseScore = 4
  } else if (metrics.ordersTotal === 0) {
    responseScore = 10
  }
  score += responseScore

  // التفاعل (10)
  let eng = 0
  if (metrics.uniqueVisitors >= 20) eng += 5
  else if (metrics.uniqueVisitors >= 5) eng += 3
  if (metrics.favoritesCount + metrics.followsCount >= 5) eng += 5
  else if (metrics.favoritesCount + metrics.followsCount >= 1) eng += 2
  score += eng

  score = Math.min(score, 100)

  const { scoreLabel, scoreTone } = getScoreLabel(score)
  insights.push(...generateInsights(metrics, comparison))

  // القوة
  if (metrics.avgRating >= 4 && metrics.reviewsTotal >= 3)
    strengths.push(`تقييم ممتاز (${metrics.avgRating} ⭐ من ${metrics.reviewsTotal} تقييم)`)
  if (metrics.ordersTotal > 0) {
    const rate = Math.round((metrics.ordersConfirmed / metrics.ordersTotal) * 100)
    if (rate >= 80) strengths.push(`نسبة إتمام الطلبات عالية (${rate}%)`)
  }
  if (metrics.avgResponseTimeMin !== null && metrics.avgResponseTimeMin <= 15)
    strengths.push(`سرعة رد ممتازة (${metrics.avgResponseTimeMin} دقيقة)`)
  if (metrics.isVerified) strengths.push('نشاط موثّق — بيعزز ثقة العملاء')
  if (metrics.mediaCount >= 5) strengths.push(`محتوى غني (${metrics.mediaCount} صورة)`)
  if (metrics.uniqueVisitors >= 30) strengths.push(`تفاعل جيد (${metrics.uniqueVisitors} زائر)`)

  // الضعف
  if (metrics.reviewsTotal === 0) weaknesses.push('مفيش تقييمات لسه — شجّع العملاء')
  else if (metrics.avgRating < 3.5 && metrics.reviewsTotal >= 3)
    weaknesses.push(`التقييم متوسط (${metrics.avgRating}) — راجع الشكاوى`)
  if (metrics.ordersTotal > 0) {
    const cancel = Math.round((metrics.ordersCancelled / metrics.ordersTotal) * 100)
    if (cancel >= 20) weaknesses.push(`نسبة إلغاء عالية (${cancel}%)`)
  }
  if (metrics.avgResponseTimeMin !== null && metrics.avgResponseTimeMin > 60)
    weaknesses.push(`سرعة الرد بطيئة (${metrics.avgResponseTimeMin} دقيقة)`)
  if (metrics.mediaCount < 3)
    weaknesses.push(`صور قليلة (${metrics.mediaCount}) — بتزيد الطلبات 40%`)
  if (!metrics.hasWhatsapp) weaknesses.push('الواتساب مش مفعّل — 70% بيفضلوه')
  if (metrics.uniqueVisitors < 5 && metrics.pageViews > 0)
    weaknesses.push('زيارات قليلة — انشر على السوشيال')

  // الفرص
  if (metrics.reviewsTotal > 0 && metrics.reviewsTotal < 10)
    opportunities.push('اطلب تقييمات — كل 10 ترفع ترتيبك 20%')
  if (!metrics.hasMenu) opportunities.push('أضف صور المنيو — بتزيد الطلبات 35%')
  if (metrics.mediaCount > 0 && metrics.mediaCount < 5)
    opportunities.push('أضف صور — النشاطات الغنية بتاخد 60% أكتر زيارات')
  if (metrics.followsCount === 0) opportunities.push('شجّع المتابعة — عشان توصلكم عروضكم')

  const compRating =
    comparison && comparison.avgRating > 0
      ? {
          self: metrics.avgRating,
          category: comparison.avgRating,
          delta: Math.round((metrics.avgRating - comparison.avgRating) * 10) / 10,
        }
      : null

  const trends = calculateTrends(metrics)
  const summary = generateSummary(score, metrics, strengths.length, weaknesses.length)

  return {
    score,
    scoreLabel,
    scoreTone,
    summary,
    insights,
    strengths,
    weaknesses,
    opportunities,
    comparison: { rating: compRating },
    trends,
  }
}

function getScoreLabel(score: number): {
  scoreLabel: string
  scoreTone: 'red' | 'orange' | 'gold' | 'teal'
} {
  if (score >= 85) return { scoreLabel: 'ممتاز', scoreTone: 'teal' }
  if (score >= 70) return { scoreLabel: 'جيد جداً', scoreTone: 'gold' }
  if (score >= 50) return { scoreLabel: 'جيد', scoreTone: 'orange' }
  return { scoreLabel: 'يحتاج تحسين', scoreTone: 'red' }
}

function generateSummary(score: number, metrics: BusinessMetrics, sc: number, wc: number): string {
  if (metrics.pageViews === 0 && metrics.ordersTotal === 0 && metrics.reviewsTotal === 0) {
    return 'نشاطك جديد — ابدأ بنشر صور، تفعيل الواتساب، ودعوة العملاء للتفاعل.'
  }
  if (score >= 85) return `أداءك ممتاز! ${sc} نقاط قوة vs ${wc} ضعف. حافظ على المستوى.`
  if (score >= 70) return `أداءك جيد جداً. عندك ${sc} نقاط قوة، بس ${wc} محتاجة تحسين.`
  if (score >= 50) return `أداءك متوسط. محتاج تركّز على ${wc} نقاط أساسية.`
  return `نشاطك محتاج شغل. ${wc} نقاط محتاجة إصلاح. ابدأ من الأولويات.`
}

function generateInsights(metrics: BusinessMetrics, comparison: ComparisonData | null): Insight[] {
  const insights: Insight[] = []

  if (metrics.reviewsTotal === 0) {
    insights.push({
      id: 'no-reviews',
      severity: 'warning',
      title: 'مفيش تقييمات لسه',
      description: 'التقييمات بتساعد 90% من العملاء ياخدوا قرارهم.',
      action: 'اطلب من 3 عملاء يكتبوا تقييم',
    })
  } else if (metrics.avgRating >= 4.5) {
    insights.push({
      id: 'great-rating',
      severity: 'success',
      title: `تقييم ممتاز (${metrics.avgRating} ⭐)`,
      description: 'عملاؤك راضيين — استغل ده في التسويق.',
      action: 'انشر التقييمات على السوشيال',
    })
  } else if (metrics.avgRating < 3.5) {
    insights.push({
      id: 'low-rating',
      severity: 'critical',
      title: `التقييم منخفض (${metrics.avgRating} ⭐)`,
      description: 'راجع التعليقات السلبية واعرف المشكلة.',
      action: 'اقرأ آخر 5 تعليقات سلبيين',
    })
  }

  if (metrics.ordersTotal === 0 && metrics.pageViews > 10) {
    insights.push({
      id: 'no-orders',
      severity: 'warning',
      title: 'في زيارات بدون طلبات',
      description: 'الناس بتزور بس مش بتطلب.',
      action: 'فعّل الواتساب + ضيف صور منيو',
    })
  }

  if (metrics.ordersTotal > 0) {
    const cancel = (metrics.ordersCancelled / metrics.ordersTotal) * 100
    if (cancel >= 20) {
      insights.push({
        id: 'high-cancel',
        severity: 'critical',
        title: `نسبة إلغاء ${Math.round(cancel)}%`,
        description: 'كتير من الطلبات بتتلغي.',
        action: 'حسّن سرعة الرد',
      })
    }
    const comp = (metrics.ordersConfirmed / metrics.ordersTotal) * 100
    if (comp >= 80) {
      insights.push({
        id: 'high-completion',
        severity: 'success',
        title: `نسبة إتمام ${Math.round(comp)}%`,
        description: 'معظم الطلبات بتكتمل بنجاح — ممتاز!',
      })
    }
  }

  if (metrics.avgResponseTimeMin !== null) {
    if (metrics.avgResponseTimeMin > 60) {
      insights.push({
        id: 'slow-response',
        severity: 'critical',
        title: `سرعة الرد بطيئة (${metrics.avgResponseTimeMin} دقيقة)`,
        description: 'كل دقيقة تأخير بتقلل القبول 15%.',
        action: 'فعّل إشعارات فورية',
      })
    } else if (metrics.avgResponseTimeMin <= 15) {
      insights.push({
        id: 'fast-response',
        severity: 'success',
        title: `رد سريع (${metrics.avgResponseTimeMin} دقيقة)`,
        description: 'سرعة ردك ممتازة.',
      })
    }
  }

  if (comparison && comparison.avgRating > 0) {
    const delta = metrics.avgRating - comparison.avgRating
    if (delta >= 0.5) {
      insights.push({
        id: 'above-category',
        severity: 'success',
        title: 'أعلى من المنافسين',
        description: `تقييمك ${metrics.avgRating} vs ${comparison.avgRating}.`,
      })
    } else if (delta <= -0.5) {
      insights.push({
        id: 'below-category',
        severity: 'warning',
        title: 'أقل من المنافسين',
        description: `تقييمك ${metrics.avgRating} vs ${comparison.avgRating}.`,
        action: 'راجع التقييمات',
      })
    }
  }

  if (!metrics.hasWhatsapp) {
    insights.push({
      id: 'no-whatsapp',
      severity: 'warning',
      title: 'الواتساب مش مفعّل',
      description: '70% بيفضلوا الطلب عبر واتساب.',
      action: 'فعّله من لوحة التحكم',
    })
  }

  if (metrics.mediaCount === 0) {
    insights.push({
      id: 'no-media',
      severity: 'warning',
      title: 'مفيش صور',
      description: 'النشاطات بالصور بتاخد 60% أكتر زيارات.',
      action: 'ارفع غلاف + لوجو + 3 صور',
    })
  } else if (metrics.mediaCount < 3) {
    insights.push({
      id: 'few-media',
      severity: 'info',
      title: `صور قليلة (${metrics.mediaCount})`,
      description: 'المزيد بيزود الثقة.',
      action: 'ارفع صور إضافية',
    })
  }

  if (!metrics.isVerified) {
    insights.push({
      id: 'not-verified',
      severity: 'info',
      title: 'نشاطك مش موثّق',
      description: 'الشارة الموثّقة بتزود الثقة 40%.',
      action: 'اشترك في المميز',
    })
  }

  if (metrics.favoritesCount + metrics.followsCount === 0 && metrics.pageViews > 5) {
    insights.push({
      id: 'no-engagement',
      severity: 'info',
      title: 'مفيش متابعين',
      description: 'شجّع العملاء على الحفظ والمتابعة.',
      action: 'أضف CTA واضح',
    })
  }

  return insights.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2, success: 3 }
    return order[a.severity] - order[b.severity]
  })
}

function calculateTrends(metrics: BusinessMetrics): AnalysisResult['trends'] {
  function trendOf(arr: Array<{ count: number }>): 'up' | 'down' | 'flat' {
    if (arr.length < 4) return 'flat'
    const half = Math.floor(arr.length / 2)
    const first = arr.slice(0, half).reduce((s, x) => s + x.count, 0) / half
    const second = arr.slice(half).reduce((s, x) => s + x.count, 0) / (arr.length - half)
    if (second > first * 1.15) return 'up'
    if (second < first * 0.85) return 'down'
    return 'flat'
  }
  return {
    viewsTrend: trendOf(metrics.viewsByDay),
    ordersTrend: trendOf(metrics.ordersByDay),
    ratingTrend: 'flat',
  }
}
