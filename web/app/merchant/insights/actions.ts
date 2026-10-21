'use server'

import { revalidatePath } from 'next/cache'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'
import { getBusinessMetrics, getCategoryComparison } from '@/lib/data/insights'
import { analyzeBusiness } from '@/lib/ai/business-advisor'
import { saveInsight } from '@/lib/ai/storage'
import { generateNarrative } from '@/lib/ai/narrative'

// ═══════════════════════════════════════════════════════════
// EAH — Insights Server Actions
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true; insightId: string } | { ok: false; error: string }

export async function generateInsight(businessId: string, days = 30): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  // فحص إن المستخدم هو صاحب النشاط أو أدمن
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

  const isAdmin = role?.role === 'admin' || role?.role === 'super_admin'
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

  const safeDays = Math.max(1, Math.min(90, Math.trunc(Number.isFinite(days) ? days : 30)))

  // 1. اجمع البيانات
  const [metrics, comparison] = await Promise.all([
    getBusinessMetrics(businessId, safeDays),
    getCategoryComparison(businessId),
  ])

  // 2. حلّل
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

  revalidatePath('/merchant/insights')
  revalidatePath(`/admin/businesses/${businessId}`)

  return { ok: true, insightId: result.insightId }
}
