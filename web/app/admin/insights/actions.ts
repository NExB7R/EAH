'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/logging/audit'
import { getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { getOrderMetricsForBusiness } from '@/lib/data/reports-orders'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import { saveInsight } from '@/lib/ai/storage'
import { generateNarrative } from '@/lib/ai/narrative'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Insights Actions
// Generate business report on behalf of admin, optionally notify owner.
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; insightId: string } | { ok: false; error: string }

export type InsightSections = {
  top_points: boolean
  recommendations: boolean
  ai_narrative: boolean
}

export async function generateAdminInsight(
  businessId: string,
  days: number,
  notifyOwner: boolean,
  sections: InsightSections,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!businessId) return { ok: false, error: 'اختار نشاط' }

  const safeDays = Math.max(1, Math.min(180, Math.trunc(Number.isFinite(days) ? days : 30)))

  const rateLimit = await checkRateLimit(strictLimiter, `admin-insight:${ctx.userId}`, {
    failClosed: true,
  })
  if (!rateLimit.ok) return { ok: false, error: rateLimit.error }

  // Validate business exists
  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, slug, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  // Generate report
  const [metrics, comparison] = await Promise.all([
    getBusinessMetrics(businessId, safeDays),
    getCategoryComparison(businessId),
  ])

  const orderMetrics = await getOrderMetricsForBusiness(
    businessId,
    new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString(),
    ctx.supabase,
  )

  const analysis = analyzeBusiness(metrics, comparison)
  const aiNarrative = sections.ai_narrative ? await generateNarrative(metrics, analysis) : null

  const saveResult = await saveInsight({
    businessId,
    metrics,
    analysis,
    comparison,
    generatedBy: ctx.userId,
    aiNarrative,
  })

  if (!saveResult.ok) return { ok: false, error: saveResult.error }

  // Null out sections the admin chose to hide
  const updates: Record<string, null> = {}
  if (!sections.top_points) updates.top_points = null
  if (!sections.recommendations) updates.recommendations = null
  if (!sections.ai_narrative) updates.ai_narrative = null
  if (Object.keys(updates).length > 0) {
    await ctx.supabase.from('business_insights').update(updates).eq('id', saveResult.insightId)
  }

  // Enrich top_points + summary with order metrics
  if (orderMetrics.total > 0) {
    const orderPoints: string[] = []
    if (orderMetrics.total > 0) {
      orderPoints.push(`📊 ${orderMetrics.total} طلب في الفترة`)
    }
    if (orderMetrics.accept_rate > 0) {
      orderPoints.push(`✅ نسبة القبول ${orderMetrics.accept_rate}%`)
    }
    if (orderMetrics.avg_response_min !== null) {
      orderPoints.push(`⚡ متوسط الرد ${orderMetrics.avg_response_min} دقيقة`)
    }
    if (orderMetrics.on_time_delivery_rate !== null) {
      orderPoints.push(`⏱️ التسليم في الوقت ${orderMetrics.on_time_delivery_rate}%`)
    }
    if (orderMetrics.feedback_count > 0 && orderMetrics.avg_feedback_rating !== null) {
      orderPoints.push(
        `⭐ رضا العملاء ${orderMetrics.avg_feedback_rating}/5 (${orderMetrics.feedback_count} تقييم)`,
      )
    }
    const issues = Object.entries(orderMetrics.issue_breakdown)
    if (issues.length > 0) {
      const top = issues.sort((a, b) => b[1] - a[1])[0]
      if (top) {
        const labels: Record<string, string> = {
          late: 'التأخير',
          missing: 'النقص',
          quality: 'الجودة',
          payment: 'الدفع',
          other: 'مشاكل أخرى',
        }
        orderPoints.push(`🔍 أبرز مشكلة: ${labels[top[0]] ?? top[0]} (${top[1]})`)
      }
    }

    const { data: existing } = await ctx.supabase
      .from('business_insights')
      .select('top_points, data')
      .eq('id', saveResult.insightId)
      .maybeSingle()

    if (existing) {
      const existingPoints = Array.isArray(existing.top_points)
        ? (existing.top_points as string[])
        : []
      const existingData = (existing.data as Record<string, unknown> | null) ?? {}

      await ctx.supabase
        .from('business_insights')
        .update({
          top_points: [...orderPoints, ...existingPoints],
          data: { ...existingData, order_metrics: orderMetrics },
        })
        .eq('id', saveResult.insightId)
    }
  }

  // Optionally notify business owner
  if (notifyOwner && biz.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'admin',
      title: `تقرير جديد لنشاط "${biz.name}"`,
      body: `الإدارة أعدّت لك تقرير أداء عن آخر ${safeDays} يوم — افتح صفحة التقارير`,
      deepLink: `/merchant/insights/${saveResult.insightId}`,
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'insight.generate',
    entityType: 'business',
    entityId: businessId,
    metadata: { days: safeDays, insight_id: saveResult.insightId, notified: notifyOwner },
  })

  revalidatePath('/admin/insights')
  revalidatePath(`/admin/businesses/${businessId}`)
  revalidateTag('businesses', 'default')

  return { ok: true, insightId: saveResult.insightId }
}

export async function deleteInsight(insightId: string): Promise<Result | { ok: true }> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!insightId) return { ok: false, error: 'معرّف التقرير مفقود' }

  const { error } = await ctx.supabase.from('business_insights').delete().eq('id', insightId)

  if (error) return { ok: false, error: 'فشل الحذف' }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'insight.delete',
    entityType: 'business_insight',
    entityId: insightId,
    metadata: {},
  })

  revalidatePath('/admin/insights')
  return { ok: true }
}
