'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { orderSchema, orderHasContent } from '@/lib/validations/order'
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
    secondary_phone: String(formData.get('secondary_phone') ?? '').trim(),
    customer_area: String(formData.get('customer_area') ?? '').trim(),
    customer_address: String(formData.get('customer_address') ?? '').trim(),
    items_summary: String(formData.get('items_summary') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
    payment_method: String(formData.get('payment_method') ?? '').trim() || null,
    attachments_json: String(formData.get('attachments_json') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غلط' }
  }

  const d = parsed.data

  // Custom: at least one content source (text OR attachments)
  if (
    !orderHasContent({
      items_summary: d.items_summary ?? '',
      attachments_json: d.attachments_json ?? '',
    })
  ) {
    return { ok: false, error: 'لازم تكتب طلبك أو ترفع صورة/صوت' }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. Gate: is order acceptance enabled for this business?
  // ═══════════════════════════════════════════════════════════════════
  const { data: settings } = await supabase
    .from('merchant_order_settings')
    .select(
      'orders_enabled, deadline_minutes, delivery_eta_minutes, offline_mode, offline_until, suspended_until',
    )
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

  const etaMinutes = settings.delivery_eta_minutes
  if (!etaMinutes) {
    return { ok: false, error: 'التاجر مش محدد مدة التسليم — كلمه مباشرة' }
  }

  const deadlineAt = new Date(nowMs + settings.deadline_minutes * 60 * 1000).toISOString()
  const expectedDeliveryAt = new Date(nowMs + etaMinutes * 60 * 1000).toISOString()

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
  type Attachment = {
    type: 'image' | 'voice'
    url: string
    size: number
    duration_sec?: number
    mime?: string
  }
  const attachments: Attachment[] = []
  if (d.attachments_json) {
    try {
      const parsedAtt = JSON.parse(d.attachments_json)
      if (Array.isArray(parsedAtt)) {
        for (const a of parsedAtt.slice(0, 5)) {
          if (!a || typeof a !== 'object') continue
          const obj = a as {
            type?: unknown
            url?: unknown
            size?: unknown
            duration_sec?: unknown
            mime?: unknown
          }
          if (
            (obj.type === 'image' || obj.type === 'voice') &&
            typeof obj.url === 'string' &&
            obj.url.startsWith('https://') &&
            typeof obj.size === 'number' &&
            obj.size > 0 &&
            obj.size <= 5_000_000
          ) {
            attachments.push({
              type: obj.type,
              url: obj.url,
              size: obj.size,
              duration_sec: typeof obj.duration_sec === 'number' ? obj.duration_sec : undefined,
              mime: typeof obj.mime === 'string' ? obj.mime : undefined,
            })
          }
        }
      }
    } catch {
      // ignore malformed
    }
  }

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
      items: (d.items_summary ?? '').trim() || null,
      notes: d.notes || null,
      customer_name: d.customer_name,
      customer_phone: d.customer_phone,
      customer_area: d.customer_area || null,
      customer_address: d.customer_address || null,
      // v2 fields
      delivery_address: d.customer_address || null,
      secondary_phone: d.secondary_phone || null,
      payment_method: d.payment_method ?? null,
      attachments,
      deadline_at: deadlineAt,
      expected_delivery_at: expectedDeliveryAt,
    })
    .select('id')
    .maybeSingle()

  if (error || !inserted) return { ok: false, error: error?.message ?? 'فشل إنشاء الطلب' }

  const orderId = inserted.id

  // Audit: record the customer creation action (non-fatal)
  const { error: reactionErr } = await supabase.from('order_reactions').insert({
    order_id: orderId,
    actor_type: 'customer',
    actor_id: user.id,
    action: 'created',
    metadata: {
      order_code: orderCode,
      has_attachments: attachments.length > 0,
      payment_method: d.payment_method ?? null,
    },
  })
  if (reactionErr) {
    // Order succeeded — don't block on audit failure
    console.warn('[order_reactions] insert failed:', reactionErr.message)
  }

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
    (d.items_summary ?? '').trim() || '(شوف المرفقات)',
    attachments.length > 0 ? `📎 ${attachments.length} مرفق` : '',
    d.notes ? `\nملاحظات: ${d.notes}` : '',
    '',
    '— مرسل من EAH',
  ]
    .filter(Boolean)
    .join('\n')

  // Robust normalization for Egyptian numbers:
  //   "01012345678"     → "201012345678"
  //   "201012345678"    → "201012345678"
  //   "+201012345678"   → "201012345678"
  const cleaned = merchantPhone.replace(/[\s+\-]/g, '')
  const normalized = cleaned.startsWith('20')
    ? cleaned
    : cleaned.startsWith('0')
      ? '20' + cleaned.slice(1)
      : '20' + cleaned

  const whatsappUrl = `https://wa.me/${normalized}?text=${encodeURIComponent(lines)}`

  // ═══════════════════════════════════════════════════════════════════
  // 6. Notify merchant — deep link straight to the order
  // ═══════════════════════════════════════════════════════════════════
  if (biz.owner_profile_id) {
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'order_new',
      title: `🔔 طلب جديد #${orderCode}`,
      body: `${d.customer_name}: ${(d.items_summary ?? '').slice(0, 80) || '(مرفق)'}`,
      deepLink: `/merchant/orders?order=${orderId}`,
      pushTag: `order-${orderId}`,
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')

  return { ok: true, orderCode, orderId, whatsappUrl }
}
