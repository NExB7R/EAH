'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/server'

const statusSchema = z.enum([
  'sent',
  'seen',
  'accepted',
  'rejected',
  'delivered',
  'cancelled',
  'preparing',
  'on_way',
])

export type OrderActionResult = { ok: true } | { ok: false; error: string }

const STATUS_LABEL: Record<string, string> = {
  sent: 'جديد',
  seen: 'شافه',
  accepted: 'اتأكد',
  rejected: 'اترفض',
  preparing: 'بيتحضّر',
  on_way: 'في الطريق',
  delivered: 'اتسلّم',
  cancelled: 'اتلغى',
}

const STATUS_BODY: Record<string, string> = {
  accepted: 'نشاطك وافق على طلبك — استعد!',
  preparing: 'طلبك بيتحضّر دلوقتي',
  on_way: 'طلبك في الطريق إليك',
  delivered: 'وصل! يا رب تكون سعيد بالخدمة',
  rejected: 'النشاط معتذر — حاول تاني أو كلمه',
  cancelled: 'الطلب اتلغى',
  seen: 'النشاط شاف طلبك',
}

async function requireMerchant() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false as const, error: 'لازم تسجل دخول' }

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, slug, name')
    .eq('owner_profile_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!biz) return { ok: false as const, error: 'مفيش نشاط مرتبط بحسابك' }
  return { ok: true as const, supabase, biz, userId: user.id }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  sent: ['seen', 'accepted', 'rejected', 'cancelled'],
  seen: ['accepted', 'rejected', 'cancelled'],
  accepted: ['preparing', 'cancelled'],
  preparing: ['on_way', 'cancelled'],
  on_way: ['delivered', 'cancelled'],
  delivered: [],
  rejected: [],
  cancelled: [],
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<OrderActionResult> {
  const ctx = await requireMerchant()
  if (!ctx.ok) return { ok: false, error: ctx.error }

  const parsed = statusSchema.safeParse(status)
  if (!parsed.success) return { ok: false, error: 'حالة غير صحيحة' }

  // تأكد إن الطلب لنشاطه
  const { data: order } = await ctx.supabase
    .from('order_requests')
    .select('id, customer_profile_id, order_code, business_id, status, accepted_at')
    .eq('id', orderId)
    .eq('business_id', ctx.biz.id)
    .maybeSingle()

  if (!order) return { ok: false, error: 'الطلب مش موجود' }

  const currentStatus = order.status as string
  const allowed = VALID_TRANSITIONS[currentStatus] ?? []
  if (!allowed.includes(parsed.data)) {
    return {
      ok: false,
      error: `مش ممكن تروح من "${currentStatus}" لـ "${parsed.data}"`,
    }
  }

  const now = new Date()
  const nowIso = now.toISOString()

  // Timestamps based on transition
  const transitionFields: Record<string, string> = {}
  if (parsed.data === 'accepted' && !order.accepted_at) {
    transitionFields.accepted_at = nowIso
  }
  if (parsed.data === 'delivered' && currentStatus !== 'delivered') {
    transitionFields.delivered_at = nowIso
    transitionFields.feedback_due_at = new Date(now.getTime() + 60 * 60 * 1000).toISOString()
    transitionFields.feedback_reminder_at = new Date(
      now.getTime() + 60 * 60 * 1000 + 30 * 60 * 1000,
    ).toISOString()
  }

  const { error } = await ctx.supabase
    .from('order_requests')
    .update({
      status: parsed.data,
      updated_at: nowIso,
      ...transitionFields,
    })
    .eq('id', orderId)

  if (error) return { ok: false, error: error.message }

  // Audit reaction
  await ctx.supabase.from('order_reactions').insert({
    order_id: orderId,
    actor_type: 'merchant',
    actor_id: ctx.userId,
    action: parsed.data,
    metadata: { from: currentStatus, to: parsed.data },
  })

  // إشعار للعميل (لو مسجل)
  if (order.customer_profile_id && STATUS_BODY[parsed.data]) {
    void createNotification({
      userId: order.customer_profile_id,
      type: 'order_status',
      title: `طلبك #${order.order_code ?? ''} — ${STATUS_LABEL[parsed.data] ?? parsed.data}`,
      body: `${ctx.biz.name}: ${STATUS_BODY[parsed.data]}`,
      deepLink: `/account/orders`,
      pushTag: `order-${orderId}-${parsed.data}`,
    }).catch(() => {})
  }

  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  revalidatePath('/merchant')
  return { ok: true }
}
