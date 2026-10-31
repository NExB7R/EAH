'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/admin'

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
  return { ok: true }
}

// ─── Pin / Unpin ───
export async function togglePin(businessId: string, pinned: boolean): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { supabase } = ctx

  const { error } = await supabase
    .from('businesses')
    .update({ featured_pin: !pinned })
    .eq('id', businessId)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(supabase, pinned ? 'featured.unpin' : 'featured.pin', businessId)
  revalidatePath('/admin/featured')
  revalidatePath('/')
  return { ok: true }
}

// ─── ترتيب (1-10) ───
export async function setFeaturedOrder(businessId: string, order: number): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { supabase } = ctx

  const safe = Math.max(1, Math.min(10, Math.floor(order)))

  const { error } = await supabase
    .from('businesses')
    .update({ featured_order: safe })
    .eq('id', businessId)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(supabase, 'featured.reorder', businessId, { order: safe })
  revalidatePath('/admin/featured')
  revalidatePath('/')
  return { ok: true }
}

// ─── تمديد المدة ───
export async function extendFeaturedUntil(businessId: string, days: number): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return { ok: false, error: ctx.error }
  const { supabase } = ctx

  const safeDays = Math.max(1, Math.min(365, Math.floor(days)))
  const until = new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('businesses')
    .update({ featured_until: until })
    .eq('id', businessId)

  if (error) return { ok: false, error: 'تعذر تنفيذ العملية. حاول مرة أخرى.' }

  await logAudit(supabase, 'featured.extend', businessId, { days: safeDays })
  revalidatePath('/admin/featured')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════
// Bulk Reorder (Drag & Drop)
// ═══════════════════════════════════════════════════════════

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
})

export async function reorderFeatured(ids: string[]): Promise<ActionResult> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = reorderSchema.safeParse({ ids })
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  // تحديث featured_order لكل نشاط حسب ترتيبه في المصفوفة
  // نستخدم Promise.all بدل bulk update (أسرع من loop مع await)
  const updates = parsed.data.ids.map((id, index) =>
    ctx.supabase
      .from('businesses')
      .update({ featured_order: index + 1 })
      .eq('id', id),
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { ok: false, error: failed.error.message }

  await logAudit(ctx.supabase, 'featured.reorder_bulk', '', {
    count: parsed.data.ids.length,
    ids: parsed.data.ids,
  })

  revalidatePath('/admin/featured')
  revalidatePath('/')
  return { ok: true }
}
