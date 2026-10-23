'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/admin'
import { createNotification } from '@/lib/notifications/server'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════════════
// Admin order actions — cancel + extend ETA
// ═══════════════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

export async function adminCancelOrder(orderId: string, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!orderId) return { ok: false, error: 'orderId مفقود' }
  const safeReason = String(reason ?? '')
    .trim()
    .slice(0, 300)
  if (safeReason.length < 3) return { ok: false, error: 'اكتب سبب الإلغاء' }

  const { data: order } = await ctx.supabase
    .from('order_requests')
    .select('id, status, customer_profile_id, order_code, business:businesses(name)')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'الطلب مش موجود' }
  if (['delivered', 'cancelled', 'rejected'].includes(order.status)) {
    return { ok: false, error: 'الطلب مقفول' }
  }

  const { error } = await ctx.supabase
    .from('order_requests')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) return { ok: false, error: 'فشل الإلغاء' }

  await ctx.supabase.from('order_reactions').insert({
    order_id: orderId,
    actor_type: 'admin',
    actor_id: ctx.userId,
    action: 'cancelled_by_admin',
    metadata: { reason: safeReason },
  })

  const bizName = (order.business as unknown as { name: string } | null)?.name ?? 'النشاط'

  if (order.customer_profile_id) {
    await createNotification({
      userId: order.customer_profile_id,
      type: 'system',
      title: `طلبك #${order.order_code} اتلغى`,
      body: `${bizName}: ${safeReason}`,
      deepLink: '/account/orders',
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'order.admin_cancel',
    entityType: 'order',
    entityId: orderId,
    metadata: { reason: safeReason },
  })

  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  return { ok: true }
}

export async function adminExtendEta(orderId: string, minutes: number): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!orderId) return { ok: false, error: 'orderId مفقود' }
  const addMin = Math.max(5, Math.min(120, Math.trunc(minutes) || 0))
  if (addMin < 5) return { ok: false, error: 'الحد الأدنى 5 دقائق' }

  const { data: order } = await ctx.supabase
    .from('order_requests')
    .select('id, status, expected_delivery_at, customer_profile_id, order_code')
    .eq('id', orderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'الطلب مش موجود' }
  if (['delivered', 'cancelled', 'rejected'].includes(order.status)) {
    return { ok: false, error: 'الطلب مقفول' }
  }

  const base = order.expected_delivery_at
    ? new Date(order.expected_delivery_at).getTime()
    : Date.now()
  const newAt = new Date(Math.max(base, Date.now()) + addMin * 60 * 1000).toISOString()

  const { error } = await ctx.supabase
    .from('order_requests')
    .update({
      expected_delivery_at: newAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (error) return { ok: false, error: 'فشل التمديد' }

  await ctx.supabase.from('order_reactions').insert({
    order_id: orderId,
    actor_type: 'admin',
    actor_id: ctx.userId,
    action: 'eta_extended',
    metadata: { minutes_added: addMin, new_expected: newAt },
  })

  if (order.customer_profile_id) {
    await createNotification({
      userId: order.customer_profile_id,
      type: 'system',
      title: `تحديث على طلبك #${order.order_code}`,
      body: `وقت التسليم اتأجل ${addMin} دقيقة — نشكرك على التفهم`,
      deepLink: '/account/orders',
    })
  }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'order.admin_extend_eta',
    entityType: 'order',
    entityId: orderId,
    metadata: { minutes_added: addMin },
  })

  revalidatePath('/admin/orders')
  revalidatePath('/account/orders')
  return { ok: true }
}
