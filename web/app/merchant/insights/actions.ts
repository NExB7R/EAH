'use server'

import { revalidatePath } from 'next/cache'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { getOrderMetricsForBusiness } from '@/lib/data/reports-orders'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import { saveInsight } from '@/lib/ai/storage'
import { generateNarrative } from '@/lib/ai/narrative'
import { getInsightDateRange } from '@/lib/ai/insight-period'

// ═══════════════════════════════════════════════════════════
// EAH — Insights Server Actions
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true; insightId: string } | { ok: false; error: string }

export async function generateInsight(businessId: string, days = 30): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل بحساب مسجل الأول' }

  // فحص إن المستخدم هو التاجر المرتبط بالنشاط أو أدمن
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id')
    .eq('id', businessId)
    .single()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const isAdmin = role?.role === 'super_admin'
  const isOwner = biz.owner_profile_id === user.id

  if (!isOwner && !isAdmin) {
    return { ok: false, error: 'مش مسموحلك' }
  }

  // Generating a narrative can trigger paid AI work. Do not allow unlimited
  // requests when the shared rate-limit provider is unavailable.
  const rateLimit = await checkRateLimit(strictLimiter, `merchant-insight:${user.id}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) {
    return { ok: false, error: rateLimit.error }
  }

  const period = getInsightDateRange(days, 90)
  const safeDays = period.days

  // 1. اجمع البيانات
  const [metrics, comparison] = await Promise.all([
    getBusinessMetrics(businessId, safeDays),
    getCategoryComparison(businessId),
  ])

  // 2. حلّل
  const orderMetrics = await getOrderMetricsForBusiness(
    businessId,
    period.start,
    period.end,
  )

  const analysis = analyzeBusiness(metrics, comparison)

  // 3. اكتب ملخص AI (best-effort — لو فشل مش مشكلة)
  const aiNarrative = await generateNarrative(metrics, analysis)

  // 4. احفظ
  const result = await saveInsight({
    businessId,
    metrics,
    analysis,
    comparison,
    generatedBy: user.id,
    aiNarrative,
  })

  if (!result.ok) {
    return { ok: false, error: result.error }
  }

  // Enrich with order metrics
  if (orderMetrics.total > 0 && result.ok) {
    const orderPoints: string[] = []
    if (orderMetrics.total > 0) orderPoints.push(`📊 ${orderMetrics.total} طلب`)
    if (orderMetrics.accept_rate > 0) orderPoints.push(`✅ قبول ${orderMetrics.accept_rate}%`)
    if (orderMetrics.avg_response_min !== null)
      orderPoints.push(`⚡ رد ${orderMetrics.avg_response_min} د`)
    if (orderMetrics.on_time_delivery_rate !== null)
      orderPoints.push(`⏱️ تسليم في الوقت ${orderMetrics.on_time_delivery_rate}%`)
    if (orderMetrics.feedback_count > 0 && orderMetrics.avg_feedback_rating !== null)
      orderPoints.push(`⭐ ${orderMetrics.avg_feedback_rating}/5`)

    const { data: existing } = await supabase
      .from('business_insights')
      .select('top_points, data')
      .eq('id', result.insightId)
      .maybeSingle()

    if (existing) {
      const existingPoints = Array.isArray(existing.top_points)
        ? (existing.top_points as string[])
        : []
      const existingData = (existing.data as Record<string, unknown> | null) ?? {}
      await supabase
        .from('business_insights')
        .update({
          top_points: [...orderPoints, ...existingPoints],
          data: { ...existingData, order_metrics: orderMetrics },
        })
        .eq('id', result.insightId)
    }
  }

  revalidatePath('/merchant/insights')
  revalidatePath(`/admin/businesses/${businessId}`)

  return { ok: true, insightId: result.insightId }
}
