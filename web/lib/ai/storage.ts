import { createClient } from '@/lib/supabase/server'
import type { BusinessMetrics, ComparisonData } from '@/lib/data/insights'
import type { AnalysisResult } from './business-advisor'

// ═══════════════════════════════════════════════════════════
// EAH — Insights Storage + Retention
// ═══════════════════════════════════════════════════════════

export type PlanRetention = {
  planCode: string
  totalLimit: number // الحد الأقصى الكلي
  completeLimit: number // كم تقرير ببيانات كاملة
}

const RETENTION_BY_PLAN: Record<string, PlanRetention> = {
  basic: { planCode: 'basic', totalLimit: 3, completeLimit: 3 },
  featured_monthly: { planCode: 'featured_monthly', totalLimit: 6, completeLimit: 6 },
  featured_quarterly: { planCode: 'featured_quarterly', totalLimit: 12, completeLimit: 12 },
  featured_yearly: { planCode: 'featured_yearly', totalLimit: 24, completeLimit: 12 },
}

const DEFAULT_RETENTION: PlanRetention = RETENTION_BY_PLAN.basic!

// ═══════════════════════════════════════════════════════════
// 1. Get Retention for Business
// ═══════════════════════════════════════════════════════════

export async function getBusinessRetention(businessId: string): Promise<PlanRetention> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('business_subscriptions')
    .select('plan:subscription_plans(code)')
    .eq('business_id', businessId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const planCode = (data?.plan as unknown as { code?: string } | null)?.code ?? 'basic'

  return RETENTION_BY_PLAN[planCode] ?? DEFAULT_RETENTION
}

// ═══════════════════════════════════════════════════════════
// 2. Save Insight + Apply Retention
// ═══════════════════════════════════════════════════════════

export type SaveInsightInput = {
  businessId: string
  metrics: BusinessMetrics
  analysis: AnalysisResult
  comparison: ComparisonData | null
  generatedBy: string | null
  aiNarrative: string | null
}

export async function saveInsight(
  input: SaveInsightInput,
): Promise<{ ok: true; insightId: string } | { ok: false; error: string }> {
  const supabase = await createClient()

  const retention = await getBusinessRetention(input.businessId)

  // 1. Insert new insight
  const { data: created, error: insertError } = await supabase
    .from('business_insights')
    .insert({
      business_id: input.businessId,
      period_start: input.metrics.periodStart,
      period_end: input.metrics.periodEnd,
      generated_by: input.generatedBy,
      data: input.metrics as unknown as Record<string, unknown>,
      score: input.analysis.score,
      summary: input.analysis.summary,
      top_points: {
        insights: input.analysis.insights,
        strengths: input.analysis.strengths,
        weaknesses: input.analysis.weaknesses,
        opportunities: input.analysis.opportunities,
        trends: input.analysis.trends,
      },
      recommendations: input.analysis.insights
        .filter((i) => i.action)
        .map((i) => ({ id: i.id, action: i.action })),
      comparison: input.comparison as unknown as Record<string, unknown> | null,
      ai_narrative: input.aiNarrative,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    return { ok: false, error: insertError?.message ?? 'حصل خطأ' }
  }

  // 2. Apply retention (background — مش هيوقف العملية)
  applyRetention(input.businessId, retention).catch(() => {
    // فشل الـ retention مش مشكلة حرجة
  })

  return { ok: true, insightId: created.id }
}

// ═══════════════════════════════════════════════════════════
// 3. Apply Retention — حذف القديم + تحويل الباقي لملخص
// ═══════════════════════════════════════════════════════════

export async function applyRetention(businessId: string, retention: PlanRetention): Promise<void> {
  const supabase = await createClient()

  // كل التقارير مرتبة من الأحدث
  const { data: all } = await supabase
    .from('business_insights')
    .select('id, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (!all || all.length === 0) return

  // 1. حذف التقارير اللي فوق الحد الأقصى
  const toDelete = all.slice(retention.totalLimit).map((r) => r.id)
  if (toDelete.length > 0) {
    await supabase.from('business_insights').delete().in('id', toDelete)
  }

  // 2. تحويل التقارير القديمة (فوق completeLimit) لملخص فقط
  const toSummarize = all.slice(retention.completeLimit, retention.totalLimit).map((r) => r.id)

  if (toSummarize.length > 0) {
    await supabase
      .from('business_insights')
      .update({
        data: {} as Record<string, unknown>,
        comparison: null,
      })
      .in('id', toSummarize)
  }
}

// ═══════════════════════════════════════════════════════════
// 4. Storage Stats — للأدمن
// ═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// 5. Manual Cleanup — للأدمن
// ═══════════════════════════════════════════════════════════
