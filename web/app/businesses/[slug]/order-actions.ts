'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { orderSchema } from '@/lib/validations/order'
import { createNotification } from '@/lib/notifications/server'

type Result = { ok: true; orderCode: string; whatsappUrl: string } | { ok: false; error: string }

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

  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name, owner_profile_id, whatsapp, phone')
    .eq('id', businessId)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'النشاط مش موجود' }
  if (!biz.whatsapp && !biz.phone) return { ok: false, error: 'النشاط مش بيستقبل طلبات' }

  const orderCode = genOrderCode()
  const merchantPhone = biz.whatsapp || biz.phone || ''

  // رسالة واتساب كاملة
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

  const { error } = await supabase.from('order_requests').insert({
    business_id: businessId,
    customer_profile_id: user.id,
    order_code: orderCode,
    status: 'sent',
    message: d.items_summary,
    customer_name: d.customer_name,
    customer_phone: d.customer_phone,
  })

  if (error) return { ok: false, error: error.message }

  if (biz.owner_profile_id) {
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'order_new',
      title: `طلب جديد #${orderCode}`,
      body: `${d.customer_name}: ${d.items_summary.slice(0, 80)}`,
      deepLink: '/merchant/orders',
      pushTag: `order-${orderCode}`,
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${slug}`)
  revalidatePath('/merchant/orders')
  revalidatePath('/account/orders')

  return { ok: true, orderCode, whatsappUrl }
}
