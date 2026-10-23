'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { orderSchema } from '@/lib/validations/order'
import { createNotification } from '@/lib/notifications/server'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

type Result =
  | { ok: true; orderCode: string; orderId: string; whatsappUrl: string }
  | { ok: false; error: string }

function genOrderCode(): string {
  const t = Date.now().toString(36).slice(-4).toUpperCase()
  const r = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `${t}${r}`
}

export async function submitOrder(
  businessId: string,
  slug: string,
  formData: FormData,
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  // Rate limit — 5 طلبات / 15 دقيقة
  const rl = await checkRateLimit(strictLimiter, `order:${user.id}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  const parsed = orderSchema.safeParse({
    customer_name: String(formData.get('customer_name') ?? '').trim(),
    customer_phone: String(formData.get('customer_phone') ?? '').trim(),
    customer_area: String(formData.get('customer_area') ?? '').trim(),
    customer_address: String(formData.get('customer_address') ?? '').trim(),
    items_summary: String(formData.get('items_summary') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غلط' }
  }

  const d = parsed.data

  // ═══════════════════════════════════════════════════════════════════
  // 1. Gate: is order acceptance enabled for this business?
  // ═══════════════════════════════════════════════════════════════════
  const { data: settings } = await supabase
    .from('merchant_order_settings')
    .select('orders_enabled, deadline_minutes, offline_mode, offline_until, suspended_until')
    .eq('business_id', businessId)
    .maybeSingle()

  if (!settings || !settings.orders_enabled) {
    return { ok: false, error: 'النشاط مش بيستقبل طلبات حالياً — كلمه مباشرة' }
  }

  const nowMs = Date.now()
  if (
    (settings.offline_mode &&
      (!settings.offline_until || new Date(settings.offline_until).getTime() > nowMs)) ||
    (settings.suspended_until && new Date(settings.suspended_until).getTime() > nowMs)
  ) {
    return { ok: false, error: 'النشاط مش متاح حالياً — جرّب تاني بعدين' }
  }

  const deadlineAt = new Date(nowMs + settings.deadline_minutes * 60 * 1000).toISOString()

  // ═══════════════════════════════════════════════════════════════════
  // 2. Fetch business + branch
  // ═══════════════════════════════════════════════════════════════════
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, owner_profile_id')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }

  const { data: branch } = await supabase
    .from('business_branches')
    .select('phone, whatsapp')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!branch?.whatsapp && !branch?.phone) {
    return { ok: false, error: 'النشاط مش بيستقبل طلبات' }
  }

  const orderCode = genOrderCode()
  const merchantPhone = branch.whatsapp || branch.phone || ''

  // ═══════════════════════════════════════════════════════════════════
  // 3. Optional new fields (v2)
  // ═══════════════════════════════════════════════════════════════════
  const paymentMethod = String(formData.get('payment_method') ?? '').trim()
  const secondaryPhone = String(formData.get('secondary_phone') ?? '').trim()
  const attachmentsJson = String(formData.get('attachments') ?? '').trim()

  let attachments: unknown = []
  if (attachmentsJson) {
    try {
      const parsed = JSON.parse(attachmentsJson)
      if (Array.isArray(parsed)) attachments = parsed.slice(0, 5)
    } catch {
      // ignore malformed
    }
  }

  const safePayment =
    paymentMethod === 'cash' || paymentMethod === 'instapay' || paymentMethod === 'wallet'
      ? paymentMethod
      : null

  // ═══════════════════════════════════════════════════════════════════
  // 4. Insert order (get id back for deep link)
  // ═══════════════════════════════════════════════════════════════════
  const { data: inserted, error } = await supabase
    .from('order_requests')
    .insert({
      business_id: businessId,
      customer_profile_id: user.id,
      order_code: orderCode,
      status: 'sent',
      items: d.items_summary,
      notes: d.notes || null,
      customer_name: d.customer_name,
      customer_phone: d.customer_phone,
      customer_area: d.customer_area || null,
      customer_address: d.customer_address || null,
      // v2 fields
      delivery_address: d.customer_address || null,
      secondary_phone: secondaryPhone || null,
      payment_method: safePayment,
      attachments,
      deadline_at: deadlineAt,
    })
    .select('id')
    .maybeSingle()

  if (error || !inserted) return { ok: false, error: error?.message ?? 'فشل إنشاء الطلب' }

  const orderId = inserted.id

  // ═══════════════════════════════════════════════════════════════════
  // 5. WhatsApp link (client opens it)
  // ═══════════════════════════════════════════════════════════════════
  const lines = [
    `طلب جديد #${orderCode}`,
    `من: ${d.customer_name}`,
    `رقم: ${d.customer_phone}`,
    d.customer_area ? `منطقة: ${d.customer_area}` : '',
    d.customer_address ? `عنوان: ${d.customer_address}` : '',
    '',
    'الطلب:',
    d.items_summary,
    d.notes ? `\nملاحظات: ${d.notes}` : '',
    '',
    '— مرسل من EAH',
  ]
    .filter(Boolean)
    .join('\n')

  const whatsappUrl = `https://wa.me/2${merchantPhone.replace(/^0/, '').replace(/^20/, '')}?text=${encodeURIComponent(lines)}`

  // ═══════════════════════════════════════════════════════════════════
  // 6. Notify merchant — deep link straight to the order
  // ═══════════════════════════════════════════════════════════════════
  if (biz.owner_profile_id) {
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'order_new',
      title: `🔔 طلب جديد #${orderCode}`,
      body: `${d.customer_name}: ${d.items_summary.slice(0, 80)}`,
      deepLink: `/merchant/orders?order=${orderId}`,
      pushTag: `order-${orderId}`,
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')

  return { ok: true, orderCode, orderId, whatsappUrl }
}
