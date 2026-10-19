'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Business Types Approval
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

const idSchema = z.string().uuid()

export async function approveBusinessType(businessId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(businessId)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      business_type_status: 'approved',
      business_type_approved_at: new Date().toISOString(),
      is_published: true,
    })
    .eq('id', parsed.data)
    .eq('business_type_status', 'pending')

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business_type.approve',
    entityType: 'business',
    entityId: parsed.data,
  })

  revalidatePath('/admin/business-types')
  revalidatePath('/admin/businesses')
  revalidatePath('/explore')
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

export async function rejectBusinessType(businessId: string, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idSchema.safeParse(businessId)
  if (!parsed.success) return { ok: false, error: 'معرّف غير صالح' }

  const cleanReason = reason.trim().slice(0, 300)

  const { error } = await ctx.supabase
    .from('businesses')
    .update({
      business_type_status: 'rejected',
      business_type_approved_at: new Date().toISOString(),
      is_published: false,
      rejection_reason: cleanReason || 'نوع النشاط غير مقبول',
      rejected_at: new Date().toISOString(),
    })
    .eq('id', parsed.data)
    .eq('business_type_status', 'pending')

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'business_type.reject',
    entityType: 'business',
    entityId: parsed.data,
    metadata: { reason: cleanReason },
  })

  revalidatePath('/admin/business-types')
  revalidatePath('/admin/businesses')
  revalidateTag('businesses', 'default')
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}
