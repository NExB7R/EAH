'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { reviewSchema, merchantReplySchema } from '@/lib/validations/review'

// ═══════════════════════════════════════════════════════════
// EAH — Review Actions
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true } | { ok: false; error: string }

// ─── إضافة تقييم جديد ───
export async function submitReview(
  businessId: string,
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول الأول' }

  const { data: existing } = await supabase
    .from('business_reviews')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return { ok: false, error: 'قيّمت النشاط ده قبل كده' }

  const parseNum = (v: FormDataEntryValue | null) => {
    const n = Number(v)
    return v && v !== '' && !isNaN(n) ? n : null
  }

  const raw = {
    taste: parseNum(formData.get('taste')),
    value_for_money: parseNum(formData.get('value_for_money')),
    speed: parseNum(formData.get('speed')),
    experience: parseNum(formData.get('experience')),
    comment: formData.get('comment')?.toString() ?? '',
  }

  const parsed = reviewSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? 'بيانات غلط' }
  }

  const data = parsed.data

  const { data: completedOrder } = await supabase
    .from('order_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_profile_id', user.id)
    .eq('status', 'delivered')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { error } = await supabase.from('business_reviews').insert({
    business_id: businessId,
    user_id: user.id,
    taste: data.taste ?? null,
    value_for_money: data.value_for_money ?? null,
    speed: data.speed ?? null,
    experience: data.experience ?? null,
    comment: data.comment,
    status: 'pending',
    source: completedOrder ? 'post_order' : 'organic',
    order_id: completedOrder?.id ?? null,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true }
}

// ─── رد التاجر ───
export async function replyToReview(
  reviewId: string,
  businessSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'لازم تسجل دخول الأول' }

  const parsed = merchantReplySchema.safeParse({
    reply: formData.get('reply')?.toString() ?? '',
  })
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? 'بيانات غلط' }
  }

  const { data: review } = await supabase
    .from('business_reviews')
    .select('business_id, merchant_reply, businesses!inner(owner_profile_id)')
    .eq('id', reviewId)
    .maybeSingle()

  if (!review) return { ok: false, error: 'التقييم مش موجود' }
  if (review.merchant_reply) return { ok: false, error: 'رديت على التقييم ده قبل كده' }

  const ownerId = (review.businesses as unknown as { owner_profile_id: string } | null)
    ?.owner_profile_id
  if (ownerId !== user.id) return { ok: false, error: 'مش صاحب النشاط' }

  const { error } = await supabase
    .from('business_reviews')
    .update({
      merchant_reply: parsed.data.reply,
      merchant_reply_at: new Date().toISOString(),
      merchant_reply_by: user.id,
    })
    .eq('id', reviewId)

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${businessSlug}`)
  return { ok: true }
}
