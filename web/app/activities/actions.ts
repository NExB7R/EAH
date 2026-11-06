'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications/server'
import { runBadgeChecks } from '@/lib/data/badges'
import { apiLimiter, checkRateLimit } from '@/lib/rate-limit'

// ═══════════════════════════════════════════════════════════
// EAH — Activity Actions (follow / favorite / like)
// ═══════════════════════════════════════════════════════════
// كل activity → trigger في DB يحدّث impact_score تلقائياً
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true; active: boolean } | { ok: false; error: string }

type ActivityType = 'follow' | 'favorite' | 'like'

async function toggleActivity(
  businessId: string,
  slug: string,
  type: ActivityType,
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.is_anonymous) return { ok: false, error: 'لازم تسجل أو تدخل بحساب مسجل الأول' }

  // Rate limit — 60 تفاعل / دقيقة (خفيف)
  const rl = await checkRateLimit(apiLimiter, `activity:${user.id}`, { failClosed: true })
  if (!rl.ok) return { ok: false, error: rl.error }

  // فحص هل موجود
  const { data: existing } = await supabase
    .from('business_activities')
    .select('id')
    .eq('business_id', businessId)
    .eq('user_id', user.id)
    .eq('activity_type', type)
    .maybeSingle()

  if (existing) {
    // احذف
    const { error } = await supabase.from('business_activities').delete().eq('id', existing.id)

    if (error) return { ok: false, error: 'تعذر تحديث التفاعل. حاول مرة أخرى.' }

    revalidatePath(`/businesses/${slug}`)
    return { ok: true, active: false }
  }

  // أضف
  const { error } = await supabase.from('business_activities').insert({
    business_id: businessId,
    user_id: user.id,
    activity_type: type,
  })

  if (error) return { ok: false, error: 'تعذر تحديث التفاعل. حاول مرة أخرى.' }

  // إشعار للتاجر المرتبط بالنشاط (عند إضافة متابعة جديدة)
  if (type === 'follow') {
    const { data: biz } = await supabase
      .from('businesses')
      .select('owner_profile_id, name')
      .eq('id', businessId)
      .maybeSingle()

    if (biz?.owner_profile_id) {
      void createNotification({
        userId: biz.owner_profile_id,
        type: 'follow_new',
        title: 'عميل جديد تابع نشاطك',
        body: `حد تابع ${biz.name} — أول ما تنزل عرض جديد هيوصله إشعار فوري`,
        deepLink: `/businesses/${slug}`,
        pushTag: 'follow',
      }).catch(() => {})
    }
  }

  revalidatePath(`/businesses/${slug}`)

  // فحص الشارات (fire-and-forget)
  void runBadgeChecks(user.id).catch(() => {})

  return { ok: true, active: true }
}

export async function toggleFollow(businessId: string, slug: string): Promise<ActionResult> {
  return toggleActivity(businessId, slug, 'follow')
}

export async function toggleFavorite(businessId: string, slug: string): Promise<ActionResult> {
  return toggleActivity(businessId, slug, 'favorite')
}
