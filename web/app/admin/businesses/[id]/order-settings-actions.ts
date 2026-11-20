'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotification } from '@/lib/notifications/server'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════
// Admin: enable/disable order acceptance + summary report on disable
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true; reportId?: string } | { ok: false; error: string }

function createAdminDb() {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

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
  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'إعدادات الطلبات غير متاحة مؤقتًا — حاول تاني' }

  if (!businessId) return { ok: false, error: 'businessId مفقود' }
  const safeDeadline = Math.max(5, Math.min(60, Math.trunc(deadlineMinutes) || 10))
  const safeEta = Math.max(15, Math.min(240, Math.trunc(deliveryEtaMinutes) || 0))
  if (safeEta < 15) {
    return { ok: false, error: 'حدد مدة التسليم (15-240 دقيقة)' }
  }

  // Fetch business + owner
  const { data: biz } = await adminDb
    .from('businesses')
    .select('id, name, slug, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }
  if (!biz.owner_profile_id) {
    return { ok: false, error: 'اربط حساب البايع بالنشاط أولًا قبل تفعيل استلام الطلبات' }
  }

  const { data: activeBranches, error: branchError } = await adminDb
    .from('business_branches')
    .select('phone, whatsapp')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .limit(25)

  if (branchError) {
    return { ok: false, error: 'تعذر التحقق من أرقام تواصل النشاط' }
  }

  let hasOrderContact = (activeBranches ?? []).some(
    (branch) =>
      (typeof branch.phone === 'string' && branch.phone.trim().length > 0) ||
      (typeof branch.whatsapp === 'string' && branch.whatsapp.trim().length > 0),
  )

  if (!hasOrderContact) {
    const { data: contacts, error: contactsError } = await adminDb
      .from('business_contact_methods')
      .select('value')
      .eq('business_id', businessId)
      .in('method_type', ['phone', 'whatsapp'])
      .limit(15)

    if (contactsError) {
      return { ok: false, error: 'تعذر التحقق من أرقام تواصل النشاط' }
    }

    hasOrderContact = (contacts ?? []).some(
      (contact) => typeof contact.value === 'string' && contact.value.trim().length > 0,
    )
  }

  if (!hasOrderContact) {
    return {
      ok: false,
      error: 'ضيف رقم هاتف أو واتساب للنشاط نفسه قبل تفعيل استقبال الطلبات. رقم البايع الشخصي مش مطلوب.',
    }
  }
  const { error: updErr } = await adminDb.from('merchant_order_settings').upsert(
    {
      business_id: businessId,
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

  // Public cards and detail pages use businesses.accepts_orders. Keep it in sync
  // with merchant_order_settings so the visible CTA and the server gate agree.
  const { data: enabledBusiness, error: enableFlagError } = await adminDb
    .from('businesses')
    .update({ accepts_orders: true })
    .eq('id', businessId)
    .select('id')
    .maybeSingle()

  if (enableFlagError || !enabledBusiness) {
    const { error: rollbackError } = await adminDb
      .from('merchant_order_settings')
      .update({ orders_enabled: false, updated_at: new Date().toISOString() })
      .eq('business_id', businessId)

    await logAudit(adminDb, {
      actorUserId: ctx.userId,
      action: 'orders.enable.business_flag_failed',
      entityType: 'business',
      entityId: businessId,
      metadata: {
        business_flag_error: enableFlagError?.message ?? 'no row updated',
        rollback_error: rollbackError?.message ?? null,
      },
    })
    return { ok: false, error: 'تعذر تفعيل الطلبات للنشاط. لم نفعّل الزر العام؛ حاول تاني.' }
  }

  // Notify merchant with obligations
  if (biz.owner_profile_id) {
    try {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'system',
        title: '🎯 استلام الطلبات اتفعّل',
        body: `من دلوقتي هتستقبل طلبات. رد خلال ${safeDeadline} دقايق · التسليم خلال ${safeEta} دقيقة. المتأخر ينقص تقييمك. لو مش متاح، اقفل الاستلام مؤقتاً (بدون عقوبة).`,
        deepLink: '/merchant/orders/settings',
      })
    } catch {
      await logAudit(adminDb, {
        actorUserId: ctx.userId,
        action: 'orders.enable.notification_failed',
        entityType: 'business',
        entityId: businessId,
      })
    }
  }

  await logAudit(adminDb, {
    actorUserId: ctx.userId,
    action: 'orders.enable',
    entityType: 'business',
    entityId: businessId,
    metadata: { deadline_minutes: safeDeadline, delivery_eta_minutes: safeEta },
  })

  revalidatePath(`/admin/businesses/${businessId}`)
  revalidatePath(`/businesses/${biz.slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/merchant/orders/settings')
  revalidateTag('businesses', 'default')
  return { ok: true }
}

export async function disableOrders(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!z.string().uuid().safeParse(businessId).success) {
    return { ok: false, error: 'معرّف النشاط غير صحيح' }
  }
  const adminDb = createAdminDb()
  if (!adminDb) return { ok: false, error: 'إعدادات الطلبات غير متاحة مؤقتًا — حاول تاني' }

  if (!businessId) return { ok: false, error: 'businessId مفقود' }

  const { data: biz } = await adminDb
    .from('businesses')
    .select('id, name, slug, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()
  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  // Period = since enabled_at (or last 30 days)
  const { data: current } = await adminDb
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
  const { data: orders } = await adminDb
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

  const { data: savedReport } = await adminDb
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

  // Turn off the public order flag first: a failure later must leave ordering closed.
  const { error: disableFlagError } = await adminDb
    .from('businesses')
    .update({ accepts_orders: false })
    .eq('id', businessId)

  if (disableFlagError) {
    return { ok: false, error: 'تعذر إيقاف الطلبات العامة — لم نغيّر إعداد الاستلام. حاول تاني.' }
  }

  // Disable
  const { error: updErr } = await adminDb
    .from('merchant_order_settings')
    .update({
      orders_enabled: false,
      orders_disabled_at: new Date().toISOString(),
      offline_mode: false,
      offline_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq('business_id', businessId)

  if (updErr) {
    await logAudit(adminDb, {
      actorUserId: ctx.userId,
      action: 'orders.disable.settings_partial_failure',
      entityType: 'business',
      entityId: businessId,
      metadata: { error: updErr.message },
    })
    return { ok: false, error: 'زر الطلب اتوقف عن الظهور، لكن تعذر حفظ إعداد الاستلام. راجع الإعدادات وحاول تاني.' }
  }

  // Notify merchant with summary
  if (biz.owner_profile_id) {
    try {
      await createNotification({
        userId: biz.owner_profile_id,
        type: 'system',
        title: '📊 ملخص فترة الاستلام',
        body: `اتوقف استلام الطلبات. الفترة (${periodLabel}): ${total} طلب — ${accepted} مقبول (${acceptRate}%) · ${rejected} مرفوض · ${expired} فات · متوسط الرد ${avgMin} دقيقة.`,
        deepLink: savedReport?.id
          ? `/merchant/insights/${savedReport.id}`
          : '/merchant/orders/settings',
      })
    } catch {
      await logAudit(adminDb, {
        actorUserId: ctx.userId,
        action: 'orders.disable.notification_failed',
        entityType: 'business',
        entityId: businessId,
        metadata: { report_id: savedReport?.id ?? null },
      })
    }
  }

  await logAudit(adminDb, {
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
  revalidatePath(`/businesses/${biz.slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/merchant/orders/settings')
  revalidatePath('/merchant/insights')
  revalidateTag('businesses', 'default')

  return { ok: true, reportId: savedReport?.id }
}
