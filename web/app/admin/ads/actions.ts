'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Ads Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; id?: string } | { ok: false; error: string }

const approveSchema = z.object({
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
})

export async function approveAd(id: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = approveSchema.safeParse({
    startsAt: String(formData.get('startsAt') ?? '').trim(),
    endsAt: String(formData.get('endsAt') ?? '').trim(),
  })

  if (!parsed.success) return { ok: false, error: 'بيانات غير صحيحة' }

  const now = new Date().toISOString()
  const { error } = await ctx.supabase
    .from('advertisements')
    .update({
      status: 'active',
      starts_at: parsed.data.startsAt || now,
      ends_at: parsed.data.endsAt || null,
      approved_by: ctx.userId,
      approved_at: now,
      rejection_reason: null,
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'ad.approve',
    entityType: 'advertisement',
    entityId: id,
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id }
}

export async function rejectAd(id: string, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('advertisements')
    .update({
      status: 'rejected',
      rejection_reason: reason || 'بدون سبب محدد',
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'ad.reject',
    entityType: 'advertisement',
    entityId: id,
    metadata: { reason: reason || null },
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id }
}

export async function pauseAd(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('advertisements')
    .update({ status: 'paused' })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'ad.pause',
    entityType: 'advertisement',
    entityId: id,
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id }
}

export async function resumeAd(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase
    .from('advertisements')
    .update({ status: 'active' })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'ad.resume',
    entityType: 'advertisement',
    entityId: id,
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true, id }
}

export async function deleteAd(id: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { error } = await ctx.supabase.from('advertisements').delete().eq('id', id)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'ad.delete',
    entityType: 'advertisement',
    entityId: id,
  })

  revalidatePath('/admin/ads')
  revalidateTag('ads', 'default')
  return { ok: true }
}
