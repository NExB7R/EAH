'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { orderSchema, orderHasContent } from '@/lib/validations/order'
import { createNotification } from '@/lib/notifications/server'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { canAcceptInAppOrders } from '@/lib/data/order-availability'
import { normalizeWhatsAppDestination } from '@/lib/data/contact-availability-utils'

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

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

  // Check publication, ownership and the activity-level order flag before reading order settings.
  // This is authoritative even when a client bypasses the order button or submits stale page data.
  const { data: biz, error: businessError } = await supabase
    .from('businesses')
    .select('id, name, slug, owner_profile_id, is_published, accepts_orders')
    .eq('id', businessId)
    .eq('slug', slug)
    .maybeSingle()

  if (businessError) {
    console.error('[submitOrder] business availability lookup failed:', businessError.message)
    return { ok: false, error: 'تعذر التحقق من إتاحة الطلب. جرّب تاني.' }
  }
  if (!biz || biz.is_published !== true) {
    return { ok: false, error: 'النشاط مش متاح للطلب حالياً' }
  }
  if (typeof biz.owner_profile_id !== 'string' || !biz.owner_profile_id.trim()) {
    return {
      ok: false,
      error: 'النشاط لسه ما اتربطش ببايع، والطلب الداخلي غير متاح حالياً — كلمه مباشرة.',
    }
  }
  if (!canAcceptInAppOrders(biz.accepts_orders, biz.owner_profile_id)) {
    return { ok: false, error: 'النشاط مش بيستقبل طلبات داخل المنصة حالياً — كلمه مباشرة.' }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Gate: is order acceptance enabled in the merchant's order settings?
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
    return { ok: false, error: 'البايع مش محدد مدة التسليم — تواصل معاه مباشرة' }
  }

  const deadlineAt = new Date(nowMs + settings.deadline_minutes * 60 * 1000).toISOString()
  const expectedDeliveryAt = new Date(nowMs + etaMinutes * 60 * 1000).toISOString()

  // ═══════════════════════════════════════════════════════════════════
  // Branch/contact for the already-validated activity
  // ═══════════════════════════════════════════════════════════════════

  // The buyer may submit an order, but must never query private branch
  // contacts directly through their authenticated Supabase client.
  let contactDb: ReturnType<typeof createServiceClient>
  try {
    contactDb = createServiceClient()
  } catch {
    return { ok: false, error: 'بيانات تواصل النشاط غير متاحة مؤقتًا. جرّب تاني.' }
  }

  const { data: branches, error: branchError } = await contactDb
    .from('business_branches')
    .select('whatsapp, is_primary, sort_order')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .order('sort_order', { ascending: true })
    .limit(25)

  if (branchError) {
    console.error('[submitOrder] branch lookup failed:', branchError.message)
    return { ok: false, error: 'تعذر التحقق من بيانات تواصل النشاط. جرّب تاني.' }
  }

  let merchantWhatsApp =
    (branches ?? [])
      .map((branch) => normalizeWhatsAppDestination(branch.whatsapp))
      .find((candidate): candidate is string => candidate !== null) ?? null

  if (!merchantWhatsApp) {
    const { data: contactRows, error: contactError } = await contactDb
      .from('business_contact_methods')
      .select('value, is_primary, sort_order')
      .eq('business_id', businessId)
      .eq('method_type', 'whatsapp')
      .eq('is_public', true)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true })
      .limit(25)

    if (contactError) {
      console.error('[submitOrder] contact fallback lookup failed:', contactError.message)
      return { ok: false, error: 'تعذر جلب بيانات تواصل النشاط. جرّب تاني.' }
    }

    merchantWhatsApp =
      (contactRows ?? [])
        .map((contact) => normalizeWhatsAppDestination(contact.value))
        .find((candidate): candidate is string => candidate !== null) ?? null
  }

  if (!merchantWhatsApp) {
    return { ok: false, error: 'النشاط مش مسجل له رقم واتساب صالح لاستقبال الطلبات' }
  }


  const orderCode = genOrderCode()

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

  // The selected destination was normalized while resolving branch/general contact methods.
  const whatsappUrl = `https://wa.me/${merchantWhatsApp}?text=${encodeURIComponent(lines)}`

  // ═══════════════════════════════════════════════════════════════════
  // 6. Notify merchant — deep link straight to the order
  // ═══════════════════════════════════════════════════════════════════
  if (biz.owner_profile_id) {
    const itemsPart = (d.items_summary ?? '').slice(0, 70) || '(تفاصيل مرفقة)'
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'order_new',
      title: `🔔 طلب جديد #${orderCode}`,
      body: `${d.customer_name}: ${itemsPart}`,
      deepLink: `/merchant/orders?order=${orderId}`,
      push: true,
      pushTag: `order-${orderId}`,
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')

  return { ok: true, orderCode, orderId, whatsappUrl }
}
