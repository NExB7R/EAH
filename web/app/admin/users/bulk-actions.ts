'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { logAudit } from '@/lib/logging/audit'
import { createServiceClient } from '@/lib/supabase/service'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Users Bulk Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true; affected: number } | { ok: false; error: string }

const idsSchema = z.array(z.string().uuid()).min(1).max(100)

// ─── حظر/فك حظر جماعي ───
const bulkBanSchema = z.object({
  ids: idsSchema,
  days: z.coerce.number().int().min(1).max(3650),
  reason: z.string().trim().min(5, 'السبب قصير').max(300),
})

type BulkModerationContext = { userId: string; role: 'super_admin' }
type PreparedTargets =
  | {
      ok: true
      admin: ReturnType<typeof createServiceClient>
      ids: string[]
      roles: Array<{ user_id: string; role: string }>
    }
  | { ok: false; error: string }

async function prepareModerationTargets(
  ctx: BulkModerationContext,
  inputIds: string[],
): Promise<PreparedTargets> {
  const ids = [...new Set(inputIds)]
  if (ids.includes(ctx.userId)) {
    return { ok: false, error: 'أزل حسابك من التحديد قبل تنفيذ الإجراء الجماعي' }
  }

  let admin: ReturnType<typeof createServiceClient>
  try {
    admin = createServiceClient()
  } catch {
    return { ok: false, error: 'إدارة المستخدمين غير متاحة مؤقتًا — حاول تاني' }
  }

  const [profilesResult, rolesResult] = await Promise.all([
    admin.from('profiles').select('id').in('id', ids),
    admin.from('user_roles').select('user_id, role').in('user_id', ids),
  ])

  if (profilesResult.error || rolesResult.error) {
    return { ok: false, error: 'تعذر التحقق من حسابات المستخدمين المحددين' }
  }
  if ((profilesResult.data ?? []).length !== ids.length) {
    return { ok: false, error: 'بعض الحسابات المحددة غير موجودة — حدّث القائمة وحاول تاني' }
  }

  const roles = (rolesResult.data ?? []) as Array<{ user_id: string; role: string }>
  const roleById = new Map(roles.map((item) => [item.user_id, item.role]))
  if (ids.some((id) => !roleById.has(id))) {
    return { ok: false, error: 'بعض الحسابات ليس لها دور مهيأ — أصلح بيانات الحساب أولًا' }
  }
  if (roles.some((item) => item.role === 'super_admin')) {
    return { ok: false, error: 'لا يمكن الحظر الجماعي أو فك الحظر عن حساب الأدمن' }
  }
  return { ok: true, admin, ids, roles }
}

export async function bulkBanUsers(ids: string[], days: number, reason: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = bulkBanSchema.safeParse({ ids, days, reason })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const prepared = await prepareModerationTargets(ctx, parsed.data.ids)
  if (!prepared.ok) return prepared

  const until = new Date()
  until.setDate(until.getDate() + parsed.data.days)
  const bannedUntil = until.toISOString()

  const { data: updated, error } = await prepared.admin
    .from('profiles')
    .update({ banned_until: bannedUntil, ban_reason: parsed.data.reason })
    .in('id', prepared.ids)
    .select('id')

  if (error) return { ok: false, error: 'تعذر حفظ الحظر الجماعي — لم يتم تأكيد أي تغيير' }
  const affectedIds = (updated ?? []).map((item) => item.id)
  if (affectedIds.length === 0) return { ok: false, error: 'لم يتغير أي سجل — حدّث القائمة وحاول تاني' }

  await logAudit(prepared.admin, {
    actorUserId: ctx.userId,
    action: 'user.bulk_ban',
    entityType: 'profile',
    metadata: {
      ids: affectedIds,
      days: parsed.data.days,
      reason: parsed.data.reason,
      banned_until: bannedUntil,
    },
  })

  revalidatePath('/admin/users')
  revalidateTag('admin-badges', 'default')
  return { ok: true, affected: affectedIds.length }
}

export async function bulkUnbanUsers(ids: string[]): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = idsSchema.safeParse(ids)
  if (!parsed.success) return { ok: false, error: 'قائمة غير صالحة' }

  const prepared = await prepareModerationTargets(ctx, parsed.data)
  if (!prepared.ok) return prepared

  const { data: updated, error } = await prepared.admin
    .from('profiles')
    .update({ banned_until: null, ban_reason: null })
    .in('id', prepared.ids)
    .select('id')

  if (error) return { ok: false, error: 'تعذر حفظ فك الحظر الجماعي — لم يتم تأكيد أي تغيير' }
  const affectedIds = (updated ?? []).map((item) => item.id)
  if (affectedIds.length === 0) return { ok: false, error: 'لم يتغير أي سجل — حدّث القائمة وحاول تاني' }

  await logAudit(prepared.admin, {
    actorUserId: ctx.userId,
    action: 'user.bulk_unban',
    entityType: 'profile',
    metadata: { ids: affectedIds, count: affectedIds.length },
  })

  revalidatePath('/admin/users')
  revalidateTag('admin-badges', 'default')
  return { ok: true, affected: affectedIds.length }
}

// ─── تغيير دور جماعي ───
const bulkRoleSchema = z.object({
  ids: idsSchema,
  role: z.enum(['customer', 'merchant']),
})

export async function bulkChangeRole(ids: string[], role: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = bulkRoleSchema.safeParse({ ids, role })
  if (!parsed.success) return { ok: false, error: 'دور أو قائمة غير صالحة' }

  const safeIds = parsed.data.ids.filter((id) => id !== ctx.userId)
  if (safeIds.length === 0) return { ok: false, error: 'مش ممكن تغير دورك' }

  let admin: ReturnType<typeof createServiceClient>
  try {
    admin = createServiceClient()
  } catch {
    return { ok: false, error: 'تغيير الأدوار غير متاح مؤقتًا — حاول تاني' }
  }

  const { data: existingRoles, error: rolesError } = await admin
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', safeIds)

  if (rolesError) return { ok: false, error: 'تعذر التحقق من الأدوار الحالية' }
  if ((existingRoles ?? []).some((item) => item.role === 'super_admin')) {
    return { ok: false, error: 'لا يمكن تغيير دور الأدمن من التعديل الجماعي' }
  }

  if (parsed.data.role !== 'merchant') {
    const { data: ownedBusinesses, error: ownerCheckError } = await admin
      .from('businesses')
      .select('owner_profile_id')
      .in('owner_profile_id', safeIds)
      .limit(1)

    if (ownerCheckError) {
      return { ok: false, error: 'تعذر التحقق من الأنشطة المرتبطة بالمستخدمين' }
    }
    if (ownedBusinesses?.length) {
      return {
        ok: false,
        error: 'لا يمكن تغيير دور بايع مرتبط بنشاط. انقل ملكية الأنشطة أو فك ربطها أولًا.',
      }
    }
  }

  // Use the privileged client only after admin authorization and role-boundary checks.
  const rows = safeIds.map((id) => ({ user_id: id, role: parsed.data.role }))
  const { error } = await admin.from('user_roles').upsert(rows, { onConflict: 'user_id' })

  if (error) return { ok: false, error: 'تعذر حفظ الأدوار الجديدة — لم يتم حذف الأدوار الحالية' }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'user.bulk_role',
    entityType: 'user_role',
    metadata: {
      ids: safeIds,
      role: parsed.data.role,
      previous_roles: (existingRoles ?? []).map((item) => ({
        user_id: item.user_id,
        role: item.role,
      })),
    },
  })

  revalidatePath('/admin/users')
  revalidateTag('admin-badges', 'default')
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

  if (error) return { ok: false, error: 'تعذر تحديث حالة التميز للحسابات المحددة. حاول مرة أخرى.' }

  await logAudit(ctx.supabase, {
    actorUserId: ctx.userId,
    action: enable ? 'user.bulk_premium_on' : 'user.bulk_premium_off',
    entityType: 'profile',
    metadata: { ids: parsed.data, count: parsed.data.length },
  })

  revalidatePath('/admin/users')
  return { ok: true, affected: parsed.data.length }
}
