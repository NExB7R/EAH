'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/server'

// ═══════════════════════════════════════════════════════════
// EAH — Merchant Subscription Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

const schema = z.object({
  planCode: z.string().min(1),
  notes: z.string().max(300).optional().or(z.literal('')),
})

export async function requestSubscription(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول' }

  // نشاطي
  const { data: biz } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_profile_id', user.id)
    .maybeSingle()

  if (!biz) return { ok: false, error: 'مفيش نشاط مرتبط بحسابك' }

  const parsed = schema.safeParse({
    planCode: String(formData.get('planCode') ?? '').trim(),
    notes: String(formData.get('notes') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  // الباقة
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id, name_ar, price_egp, code')
    .eq('code', parsed.data.planCode)
    .eq('is_active', true)
    .maybeSingle()

  if (!plan) return { ok: false, error: 'الباقة مش موجودة' }

  // مفيش طلب معلق بالفعل؟
  const { data: existing } = await supabase
    .from('business_subscriptions')
    .select('id')
    .eq('business_id', biz.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return { ok: false, error: 'عندك طلب معلق بالفعل — استنى الرد' }
  }

  const { error } = await supabase.from('business_subscriptions').insert({
    business_id: biz.id,
    plan_id: plan.id,
    status: 'pending',
    is_trial: false,
    notes: parsed.data.notes || null,
  })

  if (error) return { ok: false, error: error.message }

  // إشعار لكل الأدمن
  const { data: admins } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'super_admin'])

  if (admins && admins.length > 0) {
    await Promise.all(
      admins.map((a) =>
        createNotification({
          userId: a.user_id as string,
          type: 'admin',
          title: 'طلب اشتراك جديد',
          body: `${biz.name} طلب "${plan.name_ar}" (${plan.price_egp} ج.م)`,
          deepLink: '/admin/subscriptions',
        }),
      ),
    )
  }

  revalidatePath('/merchant/subscription')
  revalidatePath('/admin/subscriptions')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
