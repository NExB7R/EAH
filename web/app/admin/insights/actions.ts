'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { logAudit } from '@/lib/logging/audit'
import { getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import { saveInsight } from '@/lib/ai/storage'
import { generateNarrative } from '@/lib/ai/narrative'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Insights Actions
// Generate business report on behalf of admin, optionally notify owner.
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; insightId: string } | { ok: false; error: string }

export async function generateAdminInsight(
  businessId: string,
  days: number,
  notifyOwner: boolean,
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

  const analysis = analyzeBusiness(metrics, comparison)
  const aiNarrative = await generateNarrative(metrics, analysis)

  const saveResult = await saveInsight({
    businessId,
    metrics,
    analysis,
    comparison,
    generatedBy: ctx.userId,
    aiNarrative,
  })

  if (!saveResult.ok) return { ok: false, error: saveResult.error }

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
