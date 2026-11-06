'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { reviewSchema, merchantReplySchema } from '@/lib/validations/review'
import { strictLimiter, checkRateLimit } from '@/lib/rate-limit'
import { createNotification } from '@/lib/notifications/server'
import { runBadgeChecks } from '@/lib/data/badges'
import { reviewQualityScore } from '@/lib/review-dimensions'
import { checkCanInteract } from '@/lib/auth/standing'

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  // Rate limit — 5 تقييمات / 15 دقيقة
  const rl = await checkRateLimit(strictLimiter, `review:${user.id}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  // Standing check: restricted/suspended users cannot interact
  const standing = await checkCanInteract(user.id)
  if (!standing.can) {
    const expiry = standing.expiresAt ? (" لحد " + new Date(standing.expiresAt).toLocaleDateString("ar-EG")) : ""
    const statusLabel = standing.standing === "suspended" ? "موقوف" : "مقيد"
    return { ok: false, error: "حسابك " + statusLabel + " من التفاعل" + expiry + ". السبب: " + (standing.reason ?? "مخالفة الشروط") }
  }

  const { data: publishedBusiness, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('is_published', true)
    .maybeSingle()
  if (businessError) return { ok: false, error: 'تعذر التحقق من النشاط. حاول مرة أخرى.' }
  if (!publishedBusiness) return { ok: false, error: 'التقييم متاح على الأنشطة المنشورة فقط.' }

  const { data: ownedBusiness, error: ownerError } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('owner_profile_id', user.id)
    .maybeSingle()
  if (ownerError) return { ok: false, error: 'تعذر التحقق من ملكية النشاط. حاول مرة أخرى.' }
  if (ownedBusiness) return { ok: false, error: 'مينفعش تقيّم نشاطك بنفسك.' }

  const { data: existing } = await supabase
    .from('business_reviews')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) return { ok: false, error: 'قيّمت النشاط ده قبل كده' }

  const dimensionsRaw = formData.get('dimensions')?.toString() ?? '{}'
  let dimensions: Record<string, number> = {}
  try {
    const parsedJson = JSON.parse(dimensionsRaw)
    if (parsedJson && typeof parsedJson === 'object') {
      dimensions = parsedJson as Record<string, number>
    }
  } catch {
    return { ok: false, error: 'بيانات الأبعاد غلط' }
  }

  const raw = {
    dimensions,
    comment: formData.get('comment')?.toString() ?? '',
  }

  const parsed = reviewSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? 'بيانات غلط' }
  }

  const data = parsed.data

  // Only a delivered platform order can produce a transaction-verified review.
  // Fail closed if the order history cannot be checked.
  const { data: deliveredOrder, error: orderLookupError } = await supabase
    .from('order_requests')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_profile_id', user.id)
    .eq('status', 'delivered')
    .limit(1)
    .maybeSingle()

  if (orderLookupError) {
    return { ok: false, error: 'مش قادرين نتحقق من اكتمال الطلب دلوقتي. حاول مرة أخرى.' }
  }
  if (!deliveredOrder) {
    return { ok: false, error: 'تقدر تقيّم النشاط بعد اكتمال طلب مسجل على EAH.' }
  }

  const quality = reviewQualityScore(data.comment, true)

  const { error } = await supabase.from('business_reviews').insert({
    business_id: businessId,
    user_id: user.id,
    dimensions: data.dimensions,
    comment: data.comment,
    status: 'pending',
    review_quality_score: quality,
    is_verified_transaction: true,
  })

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'قيّمت النشاط ده قبل كده' }
    console.error('[review] insert failed:', error.message)
    return { ok: false, error: 'تعذر حفظ التقييم الآن. حاول مرة أخرى.' }
  }

  // سجّل activity (comment) — trigger هيحدّث impact_score تلقائياً
  await supabase.from('business_activities').insert({
    business_id: businessId,
    user_id: user.id,
    activity_type: 'comment',
    metadata: { review_id: null },
  })

  // إشعار لالتاجر المرتبط بالنشاط
  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id, name')
    .eq('id', businessId)
    .maybeSingle()

  if (biz?.owner_profile_id) {
    void createNotification({
      userId: biz.owner_profile_id,
      type: 'review',
      title: 'تقييم جديد على نشاطك',
      body: `${biz.name}: حد كتب تقييم جديد — افتح صفحتك عشان تشوف التفاصيل وترد`,
      deepLink: `/businesses/${slug}#reviews-section`,
      pushTag: 'review',
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${slug}`)

  // فحص الشارات (fire-and-forget)
  void runBadgeChecks(user.id).catch(() => {})

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
  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  // Rate limit — 5 ردود / 15 دقيقة
  const rl = await checkRateLimit(strictLimiter, `reply:${user.id}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  // Standing check: restricted/suspended users cannot interact
  const standing = await checkCanInteract(user.id)
  if (!standing.can) {
    const expiry = standing.expiresAt ? (" لحد " + new Date(standing.expiresAt).toLocaleDateString("ar-EG")) : ""
    const statusLabel = standing.standing === "suspended" ? "موقوف" : "مقيد"
    return { ok: false, error: "حسابك " + statusLabel + " من التفاعل" + expiry + ". السبب: " + (standing.reason ?? "مخالفة الشروط") }
  }

  const parsed = merchantReplySchema.safeParse({
    reply: formData.get('reply')?.toString() ?? '',
  })
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: first?.message ?? 'بيانات غلط' }
  }

  const { data: review } = await supabase
    .from('business_reviews')
    .select('business_id, status, merchant_reply, businesses!inner(owner_profile_id)')
    .eq('id', reviewId)
    .maybeSingle()

  if (!review) return { ok: false, error: 'التقييم مش موجود' }
  if (review.status !== 'approved') return { ok: false, error: 'الرد متاح بعد اعتماد التقييم من الإدارة' }
  if (review.merchant_reply) return { ok: false, error: 'رديت على التقييم ده قبل كده' }

  const ownerId = (review.businesses as unknown as { owner_profile_id: string } | null)
    ?.owner_profile_id
  if (ownerId !== user.id) return { ok: false, error: 'مش التاجر المرتبط بالنشاط' }

  const { data: updatedReview, error } = await supabase
    .from('business_reviews')
    .update({
      merchant_reply: parsed.data.reply,
      merchant_reply_at: new Date().toISOString(),
      merchant_reply_by: user.id,
    })
    .eq('id', reviewId)
    .is('merchant_reply', null)
    .select('id')
    .maybeSingle()

  if (error) {
    console.error('[review-reply] update failed:', error.message)
    return { ok: false, error: 'تعذر حفظ الرد الآن. حاول مرة أخرى.' }
  }
  if (!updatedReview) return { ok: false, error: 'لم يتم حفظ الرد؛ ربما سبق الرد على هذا التقييم' }

  // إشعار لصاحب التقييم
  const { data: reviewMeta } = await supabase
    .from('business_reviews')
    .select('user_id')
    .eq('id', reviewId)
    .maybeSingle()

  if (reviewMeta?.user_id) {
    void createNotification({
      userId: reviewMeta.user_id,
      type: 'review_reply',
      title: 'رد التاجر المرتبط بالنشاط على تقييمك',
      body: 'شوف رده على تقييمك — يمكن يجاوب على استفسارك',
      deepLink: `/businesses/${businessSlug}#reviews-section`,
      pushTag: 'review-reply',
    }).catch(() => {})
  }

  revalidatePath(`/businesses/${businessSlug}`)
  return { ok: true }
}
