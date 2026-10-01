'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  if (!user) return { ok: false, error: 'لازم تسجل دخول الأول' }

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

    if (error) return { ok: false, error: error.message }

    revalidatePath(`/businesses/${slug}`)
    return { ok: true, active: false }
  }

  // أضف
  const { error } = await supabase.from('business_activities').insert({
    business_id: businessId,
    user_id: user.id,
    activity_type: type,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/businesses/${slug}`)
  return { ok: true, active: true }
}

export async function toggleFollow(businessId: string, slug: string): Promise<ActionResult> {
  return toggleActivity(businessId, slug, 'follow')
}

export async function toggleFavorite(businessId: string, slug: string): Promise<ActionResult> {
  return toggleActivity(businessId, slug, 'favorite')
}

export async function toggleLike(businessId: string, slug: string): Promise<ActionResult> {
  return toggleActivity(businessId, slug, 'like')
}
