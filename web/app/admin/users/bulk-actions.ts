'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Users Bulk Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; affected: number } | { ok: false; error: string }

const idsSchema = z.array(z.string().uuid()).min(1).max(100)

// ─── حظر جماعي ───
const bulkBanSchema = z.object({
  ids: idsSchema,
  days: z.coerce.number().int().min(1).max(3650),
  reason: z.string().min(5, 'السبب قصير').max(300),
})

export async function bulkBanUsers(ids: string[], days: number, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = bulkBanSchema.safeParse({ ids, days, reason: reason.trim() })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  // استبعاد نفس الأدمن
  const safeIds = parsed.data.ids.filter((id) => id !== ctx.userId)
  if (safeIds.length === 0) return { ok: false, error: 'مش ممكن تحظر نفسك' }

  const until = new Date()
  until.setDate(until.getDate() + parsed.data.days)

  const { error } = await ctx.supabase
    .from('profiles')
    .update({
      banned_until: until.toISOString(),
      ban_reason: parsed.data.reason,
    })
    .in('id', safeIds)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'user.bulk_ban',
    entityType: 'profile',
    metadata: { ids: safeIds, days: parsed.data.days, reason: parsed.data.reason },
  })

  revalidatePath('/admin/users')
  revalidateTag('admin-badges', 'default')
  return { ok: true, affected: safeIds.length }
}

// ─── إلغاء حظر جماعي ───
export async function bulkUnbanUsers(ids: string[]): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ banned_until: null, ban_reason: null })
    .in('id', parsed.data)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'user.bulk_unban',
    entityType: 'profile',
    metadata: { ids: parsed.data, count: parsed.data.length },
  })

  revalidatePath('/admin/users')
  revalidateTag('admin-badges', 'default')
  return { ok: true, affected: parsed.data.length }
}

// ─── تغيير دور جماعي ───
const bulkRoleSchema = z.object({
  ids: idsSchema,
  role: z.enum(['customer', 'merchant', 'admin', 'super_admin']),
})

export async function bulkChangeRole(ids: string[], role: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = bulkRoleSchema.safeParse({ ids, role })
  if (!parsed.success) return { ok: false, error: 'دور أو قائمة غير صالحة' }

  const safeIds = parsed.data.ids.filter((id) => id !== ctx.userId)
  if (safeIds.length === 0) return { ok: false, error: 'مش ممكن تغير دورك' }

  // upsert على user_roles
  const rows = safeIds.map((id) => ({ user_id: id, role: parsed.data.role }))

  const { error } = await ctx.supabase.from('user_roles').upsert(rows, { onConflict: 'user_id' })

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: 'user.bulk_role',
    entityType: 'user_role',
    metadata: { ids: safeIds, role: parsed.data.role },
  })

  revalidatePath('/admin/users')
  return { ok: true, affected: safeIds.length }
}

// ─── ترقية جماعية لـ premium ───
export async function bulkTogglePremium(ids: string[], enable: boolean): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ is_premium: enable })
    .in('id', parsed.data)

  if (error) return { ok: false, error: error.message }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: enable ? 'user.bulk_premium_on' : 'user.bulk_premium_off',
    entityType: 'profile',
    metadata: { ids: parsed.data, count: parsed.data.length },
  })

  revalidatePath('/admin/users')
  return { ok: true, affected: parsed.data.length }
}
