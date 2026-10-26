'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotification } from '@/lib/notifications/server'
import { logAudit } from '@/lib/logging/audit'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════
// Admin: enable/disable order acceptance + summary report on disable
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true; reportId?: string } | { ok: false; error: string }

export async function enableOrders(
  businessId: string,
  deadlineMinutes: number,
  deliveryEtaMinutes: number,
): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!z.string().uuid().safeParse(businessId).success) {
    return { ok: false, error: 'معرّف النشاط غير صحيح' }
  }
  if (!Number.isInteger(deadlineMinutes) || deadlineMinutes < 5 || deadlineMinutes > 60) {
    return { ok: false, error: 'مدة الرد لازم تكون من 5 لـ 60 دقيقة' }
  }
  if (
    !Number.isInteger(deliveryEtaMinutes) ||
    deliveryEtaMinutes < 15 ||
    deliveryEtaMinutes > 240
  ) {
    return { ok: false, error: 'مدة التسليم لازم تكون من 15 لـ 240 دقيقة' }
  }
  const safeDeadline = deadlineMinutes
  const safeEta = deliveryEtaMinutes

  // Fetch business + owner
  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id, is_published')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }
  if (!biz.owner_profile_id || !biz.is_published) {
    return { ok: false, error: 'لازم النشاط يكون منشور ومرتبط بمالك قبل تفعيل الطلبات' }
  }

  const { error: updErr } = await ctx.supabase.from('merchant_order_settings').upsert(
    {
      business_id: businessId,
      admin_enabled: true,
      orders_enabled: true,
      deadline_minutes: safeDeadline,
      delivery_eta_minutes: safeEta,
      orders_enabled_at: new Date().toISOString(),
      offline_mode: false,
      offline_until: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'business_id' },
  )

  if (updErr) return { ok: false, error: 'فشل تفعيل الاستلام' }

  // Notify merchant with obligations
  if (biz.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'system',
      title: '🎯 استلام الطلبات اتفعّل',
      body: `من دلوقتي هتستقبل طلبات. رد خلال ${safeDeadline} دقايق · التسليم خلال ${safeEta} دقيقة. المتأخر ينقص تقييمك. لو مش متاح، اقفل الاستلام مؤقتاً (بدون عقوبة).`,
      deepLink: '/merchant/orders/settings',
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'orders.enable',
    entityType: 'business',
    entityId: businessId,
    metadata: { deadline_minutes: safeDeadline, delivery_eta_minutes: safeEta },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/merchant/orders/settings')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

export async function disableOrders(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!businessId) return { ok: false, error: 'businessId مفقود' }

  const { data: biz } = await ctx.supabase
    .from('businesses')
    .select('id, name, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  // Period = since enabled_at (or last 30 days)
  const { data: current } = await ctx.supabase
    .from('merchant_order_settings')
    .select('orders_enabled_at')
    .eq('business_id', businessId)
    .maybeSingle()

  const now = new Date()
  const periodStart = current?.orders_enabled_at
    ? new Date(current.orders_enabled_at)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const periodEnd = now

  // Fetch orders in period
  const { data: orders } = await ctx.supabase
    .from('order_requests')
    .select('status, created_at, accepted_at, delivered_at')
    .eq('business_id', businessId)
    .gte('created_at', periodStart.toISOString())
    .lte('created_at', periodEnd.toISOString())

  const list = orders ?? []
  const total = list.length
  const accepted = list.filter((o) =>
    ['accepted', 'preparing', 'on_way', 'delivered'].includes(o.status),
  ).length
  const rejected = list.filter((o) => o.status === 'rejected').length
  const expired = list.filter((o) => o.status === 'expired').length
  const delivered = list.filter((o) => o.status === 'delivered').length

  const responseTimes = list
    .filter((o) => o.accepted_at)
    .map((o) => (new Date(o.accepted_at!).getTime() - new Date(o.created_at).getTime()) / 1000)
  const avgResponseSec =
    responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0
  const avgMin = Math.round(avgResponseSec / 60)
  const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0

  // Save summary report in business_insights (uses existing schema)
  const periodLabel = `${periodStart.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })} — ${periodEnd.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}`
  const summaryText = `ملخص فترة استلام الطلبات (${periodLabel}) — ${total} طلب وارد`
  const topPoints = [
    `📥 ${total} طلب وارد في الفترة`,
    `✅ ${accepted} طلب مقبول (${acceptRate}%)`,
    `❌ ${rejected} طلب مرفوض`,
    `⏱️ ${expired} طلب فات دون رد`,
    `📦 ${delivered} طلب تم تسليمه`,
    `⚡ متوسط الرد: ${avgMin} دقيقة`,
  ]
  const narrative = [
    `التقرير يلخص فترة استلام الطلبات من ${periodStart.toLocaleString('ar-EG')} إلى ${periodEnd.toLocaleString('ar-EG')}.`,
    '',
    `إجمالي الطلبات: ${total}`,
    `نسبة القبول: ${acceptRate}%`,
    `متوسط زمن الرد: ${avgMin} دقيقة`,
    `الطلبات المرفوضة: ${rejected}`,
    `الطلبات الفائتة (بدون رد): ${expired}`,
    `الطلبات المسلّمة: ${delivered}`,
  ].join('\n')

  const { data: savedReport } = await ctx.supabase
    .from('business_insights')
    .insert({
      business_id: businessId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      generated_by: null,
      data: {
        kind: 'order-acceptance-period',
        total,
        accepted,
        rejected,
        expired,
        delivered,
        accept_rate: acceptRate,
        avg_response_min: avgMin,
      },
      score: null,
      summary: summaryText,
      top_points: topPoints,
      recommendations: null,
      comparison: null,
      ai_narrative: narrative,
    })
    .select('id')
    .maybeSingle()

  // Disable
  const { error: updErr } = await ctx.supabase
    .from('merchant_order_settings')
    .update({
      admin_enabled: false,
      orders_enabled: false,
      orders_disabled_at: new Date().toISOString(),
      offline_mode: false,
      offline_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)

  if (updErr) return { ok: false, error: 'فشل إيقاف الاستلام' }

  // Notify merchant with summary
  if (biz.owner_profile_id) {
    await createNotification({
      userId: biz.owner_profile_id,
      type: 'system',
      title: '📊 ملخص فترة الاستلام',
      body: `اتوقف استلام الطلبات. الفترة (${periodLabel}): ${total} طلب — ${accepted} مقبول (${acceptRate}%) · ${rejected} مرفوض · ${expired} فات · متوسط الرد ${avgMin} دقيقة.`,
      deepLink: savedReport?.id
        ? `/merchant/insights/${savedReport.id}`
        : '/merchant/orders/settings',
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'orders.disable',
    entityType: 'business',
    entityId: businessId,
    metadata: {
      report_id: savedReport?.id ?? null,
      total,
      accepted,
      rejected,
      expired,
    },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/insights')
  revalidateTag('businesses', 'default')

  return { ok: true, reportId: savedReport?.id }
}
