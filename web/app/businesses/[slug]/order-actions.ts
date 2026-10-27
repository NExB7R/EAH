'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { orderSchema, orderHasContent } from '@/lib/validations/order'
import { parseOrderAttachments, verifyOrderAttachment } from '@/lib/validations/order-attachments'
import { sendPushToUser } from '@/lib/push/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isOpenNow } from '@/lib/utils/working-hours'
import type { WorkingHours } from '@/lib/data/businesses'
import { z } from 'zod'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'

type Result =
  | { ok: true; orderCode: string; orderId: string }
  | { ok: false; error: string }

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
  const identity = z.object({ businessId: z.string().uuid(), slug: z.string().min(1).max(120) })
  if (!identity.safeParse({ businessId, slug }).success) {
    return { ok: false, error: 'النشاط المطلوب غير صحيح' }
  }

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

  const attachmentsInput = d.attachments_json ?? ''
  const parsedAttachments = parseOrderAttachments(attachmentsInput)
  if (!parsedAttachments) {
    return { ok: false, error: 'فيه مرفق غير صحيح. ارفعه مرة تانية.' }
  }

  if (parsedAttachments.length > 0) {
    const signingSecret = process.env.CLOUDINARY_API_SECRET
    if (
      !signingSecret ||
      parsedAttachments.some(
        (attachment) => !verifyOrderAttachment(user.id, attachment, signingSecret),
      )
    ) {
      return { ok: false, error: 'انتهت صلاحية المرفق أو تعذر التحقق منه. ارفعه مرة تانية.' }
    }
  }

  // Custom: at least one content source (text OR attachments)
  if (
    !orderHasContent({
      items_summary: d.items_summary ?? '',
      attachments_json: d.attachments_json ?? '',
    })
  ) {
    return { ok: false, error: 'لازم تكتب طلبك أو ترفع صورة/صوت' }
  }

  // Read private settings only on the server; client props are not an authorization boundary.
  const privileged = createServiceClient()
  const [{ data: biz, error: businessError }, { data: settings, error: settingsError }] =
    await Promise.all([
      privileged
        .from('businesses')
        .select(
          'id, slug, name, owner_profile_id, is_published, accepts_orders, working_hours, open_now_override',
        )
        .eq('id', businessId)
        .eq('slug', slug)
        .maybeSingle(),
      privileged
        .from('merchant_order_settings')
        .select(
          'admin_enabled, orders_enabled, deadline_minutes, delivery_eta_minutes, offline_mode, offline_until, suspended_until',
        )
        .eq('business_id', businessId)
        .maybeSingle(),
    ])

  if (businessError || settingsError) {
    console.error('[orders] failed to validate order availability')
    return { ok: false, error: 'تعذر التحقق من استقبال الطلبات. جرّب تاني.' }
  }
  if (!biz || !biz.is_published) return { ok: false, error: 'النشاط مش متاح حالياً' }
  if (!biz.owner_profile_id) {
    return { ok: false, error: 'النشاط محتاج مالك مفعّل قبل استقبال الطلبات' }
  }
  if (!biz.accepts_orders || !settings?.admin_enabled || !settings.orders_enabled) {
    return { ok: false, error: 'النشاط مش بيستقبل طلبات حالياً' }
  }

  const nowMs = Date.now()
  const hours = (biz.working_hours ?? null) as WorkingHours | null
  const currentlyOpen =
    typeof biz.open_now_override === 'boolean' ? biz.open_now_override : isOpenNow(hours)
  if (!currentlyOpen) return { ok: false, error: 'النشاط مغلق حالياً' }

  const offlineUntil = settings.offline_until ? new Date(settings.offline_until).getTime() : null
  const suspendedUntil = settings.suspended_until
    ? new Date(settings.suspended_until).getTime()
    : null
  const isOffline = settings.offline_mode && (offlineUntil === null || offlineUntil > nowMs)
  const isSuspended = suspendedUntil !== null && suspendedUntil > nowMs
  if (isOffline || isSuspended) {
    return { ok: false, error: 'النشاط مش متاح حالياً — جرّب تاني بعدين' }
  }

  const etaMinutes = settings.delivery_eta_minutes
  if (
    typeof etaMinutes !== 'number' ||
    !Number.isInteger(etaMinutes) ||
    etaMinutes < 15 ||
    etaMinutes > 240
  ) {
    return { ok: false, error: 'التاجر لسه محددش مدة تسليم صحيحة' }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. Optional new fields (v2)
  // ═══════════════════════════════════════════════════════════════════
  const attachments = parsedAttachments.map((attachment) => ({
    type: attachment.type,
    url: attachment.url,
    size: attachment.size,
    mime: attachment.mime,
    ...(attachment.duration_sec === undefined
      ? {}
      : { duration_sec: attachment.duration_sec }),
  }))

  // ═══════════════════════════════════════════════════════════════════
  // 4. Insert order (get id back for deep link)
  // ═══════════════════════════════════════════════════════════════════
  // Only this validated, rate-limited server action can create order_requests.
  // The database trigger independently rechecks intake eligibility and owns system fields.
  const { data: inserted, error } = await privileged
    .from('order_requests')
    .insert({
      business_id: businessId,
      customer_profile_id: user.id,
      items: (d.items_summary ?? '').trim() || null,
      notes: d.notes || null,
      customer_name: d.customer_name,
      customer_phone: d.customer_phone,
      customer_area: d.customer_area || null,
      customer_address: d.customer_address || null,
      delivery_address: d.customer_address || null,
      secondary_phone: d.secondary_phone || null,
      payment_method: d.payment_method ?? null,
      attachments,
    })
    .select('id, order_code')
    .maybeSingle()

  if (error || !inserted) {
    console.error('[orders] insert failed:', error?.message ?? 'no row returned')
    return { ok: false, error: 'فشل إنشاء الطلب. جرّب تاني.' }
  }

  const orderId = inserted.id
  const orderCode = inserted.order_code || `EAH-${orderId.slice(0, 8).toUpperCase()}`

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

  // The in-app notification row is created by the order INSERT trigger.
  // Push delivery is best-effort; a push-provider failure must not undo the order.
  if (biz.owner_profile_id) {
    void sendPushToUser(biz.owner_profile_id, {
      title: `طلب جديد #${orderCode}`,
      body: `${d.customer_name}: ${(d.items_summary ?? '').slice(0, 70) || '(تفاصيل مرفقة)'}`,
      url: `/merchant/orders?order=${orderId}`,
      tag: `order-${orderId}`,
    }).catch((error: unknown) => {
      console.error(
        '[orders] push delivery failed:',
        error instanceof Error ? error.message : 'unknown error',
      )
    })
  }

  revalidatePath(`/businesses/${slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')
  revalidateTag('businesses', 'default')

  return { ok: true, orderCode, orderId }
}
