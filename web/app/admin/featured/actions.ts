'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'
import { hasPaidFeaturedHomeSubscription } from '@/lib/data/featured-eligibility'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Featured Actions
// ═══════════════════════════════════════════════════════════

type ActionResult = { ok: true } | { ok: false; error: string }

async function logAudit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  action: string,
  targetId: string,
  meta: Record<string, unknown> = {},
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('audit_logs').insert({
    actor_user_id: user.id,
    action,
    entity_type: 'business',
    entity_id: targetId,
    metadata: meta,
  })
}

// ─── تفعيل / إلغاء التمييز ───
export async function toggleFeatured(
  businessId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { supabase } = ctx

  if (!isFeatured && !(await hasPaidFeaturedHomeSubscription(businessId))) {
    return {
      ok: false,
      error: 'الظهور في الرئيسية يحتاج اشتراكًا مدفوعًا ساريًا يتضمن «ظهور في الرئيسية».',
    }
  }

  const patch = isFeatured
    ? {
        is_featured: false,
        featured_pin: false,
        featured_until: null,
      }
    : {
        is_featured: true,
        featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

  const { error } = await supabase.from('businesses').update(patch).eq('id', businessId)
  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(supabase, isFeatured ? 'featured.disable' : 'featured.enable', businessId)
  revalidatePath('/admin/featured')
  revalidatePath('/')
  revalidatePath('/featured')
  revalidateTag('businesses', 'default')
  revalidateTag('featured', 'default')
  return { ok: true }
}

// ─── تمديد المدة ───
export async function extendFeaturedUntil(businessId: string, days: number): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { supabase } = ctx

  if (!(await hasPaidFeaturedHomeSubscription(businessId))) {
    return {
      ok: false,
      error: 'لا يمكن تجديد الظهور قبل وجود اشتراك مدفوع ساري يتضمن «ظهور في الرئيسية».',
    }
  }

  const safeDays = Math.max(1, Math.min(365, Math.floor(days)))
  const until = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('businesses')
    .update({ featured_until: until })
    .eq('id', businessId)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(supabase, 'featured.extend', businessId, { days: safeDays })
  revalidatePath('/admin/featured')
  revalidatePath('/')
  revalidatePath('/featured')
  revalidateTag('businesses', 'default')
  revalidateTag('featured', 'default')
  return { ok: true }
}

