'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/service'
import { logAudit } from '@/lib/logging/audit'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Users Actions
// ═══════════════════════════════════════════════════════════

type Result = { ok: true } | { ok: false; error: string }

// ─── Ban / Unban ───

const banSchema = z.object({
  days: z.coerce.number().int().min(1).max(3650),
  reason: z.string().trim().min(5).max(300),
})

const userIdSchema = z.string().uuid()

type ModerationTargetResult =
  | { ok: true; role: string }
  | { ok: false; error: string }

async function validateModerationTarget(
  admin: ReturnType<typeof createServiceClient>,
  userId: string,
  actorRole: 'super_admin',
): Promise<ModerationTargetResult> {
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) return { ok: false, error: 'تعذر التحقق من المستخدم' }
  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  const { data: roleRow, error: roleError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (roleError) return { ok: false, error: 'تعذر التحقق من صلاحيات المستخدم' }
  if (!roleRow?.role) return { ok: false, error: 'حساب المستخدم ليس له دور مهيأ داخل النظام' }
  if (roleRow.role === 'super_admin') {
    return { ok: false, error: 'لا يمكن حظر حساب الأدمن من هذه الشاشة أو فك حظره' }
  }
  return { ok: true, role: roleRow.role }
}

function createModerationClient() {
  try {
    return createServiceClient()
  } catch {
    return null
  }
}

export async function banUser(userId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!userIdSchema.safeParse(userId).success) {
    return { ok: false, error: 'معرّف المستخدم غير صحيح' }
  }
  if (userId === ctx.userId) return { ok: false, error: 'مش ممكن تحظر نفسك' }

  const parsed = banSchema.safeParse({
    days: formData.get('days'),
    reason: String(formData.get('reason') ?? ''),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  const admin = createModerationClient()
  if (!admin) return { ok: false, error: 'إدارة الحظر غير متاحة مؤقتًا — حاول تاني' }

  const target = await validateModerationTarget(admin, userId, ctx.role)
  if (!target.ok) return target

  const until = new Date()
  until.setDate(until.getDate() + parsed.data.days)
  const bannedUntil = until.toISOString()

  const { data: updated, error } = await admin
    .from('profiles')
    .update({ banned_until: bannedUntil, ban_reason: parsed.data.reason })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حفظ الحظر — لم يتم تأكيد أي تغيير' }
  if (!updated) return { ok: false, error: 'لم يتغير أي سجل — حدّث الصفحة وتأكد من وجود المستخدم' }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'user.ban',
    entityType: 'profile',
    entityId: userId,
    metadata: {
      days: parsed.data.days,
      reason: parsed.data.reason,
      banned_until: bannedUntil,
      target_role: target.role,
    },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

export async function unbanUser(userId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!userIdSchema.safeParse(userId).success) {
    return { ok: false, error: 'معرّف المستخدم غير صحيح' }
  }
  if (userId === ctx.userId) return { ok: false, error: 'لا يمكن تنفيذ الإجراء على حسابك' }

  const admin = createModerationClient()
  if (!admin) return { ok: false, error: 'إدارة الحظر غير متاحة مؤقتًا — حاول تاني' }

  const target = await validateModerationTarget(admin, userId, ctx.role)
  if (!target.ok) return target

  const { data: updated, error } = await admin
    .from('profiles')
    .update({ banned_until: null, ban_reason: null })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (error) return { ok: false, error: 'تعذر حفظ فك الحظر — لم يتم تأكيد أي تغيير' }
  if (!updated) return { ok: false, error: 'لم يتغير أي سجل — حدّث الصفحة وتأكد من وجود المستخدم' }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'user.unban',
    entityType: 'profile',
    entityId: userId,
    metadata: { target_role: target.role },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── Change Role ───

const roleSchema = z.enum(['customer', 'merchant'])

export async function changeUserRole(userId: string, role: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  if (!userIdSchema.safeParse(userId).success) {
    return { ok: false, error: 'معرّف المستخدم غير صحيح' }
  }
  if (userId === ctx.userId) return { ok: false, error: 'مش ممكن تغير دورك' }

  const parsed = roleSchema.safeParse(role)
  if (!parsed.success) return { ok: false, error: 'دور غير صحيح' }

  let admin: ReturnType<typeof createServiceClient>
  try {
    admin = createServiceClient()
  } catch {
    return { ok: false, error: 'تغيير الدور غير متاح مؤقتًا — حاول تاني' }
  }

  // user_roles is self-readable under RLS, so inspect the target through the
  // service client only after the caller has passed requireAdmin().
  const { data: targetRole, error: targetRoleError } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle()

  if (targetRoleError) {
    return { ok: false, error: 'تعذر التحقق من الدور الحالي للمستخدم' }
  }
  if (targetRole?.role === 'super_admin') {
    return { ok: false, error: 'ده حساب الأدمن المحمي الوحيد؛ ممنوع تغيير دوره من شاشة المستخدمين' }
  }

  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) return { ok: false, error: 'تعذر التحقق من المستخدم' }
  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  if (targetRole?.role === parsed.data) return { ok: true }

  // An activity owner must keep the seller role to retain management access.
  if (parsed.data !== 'merchant') {
    const { data: ownedBusiness, error: ownerCheckError } = await admin
      .from('businesses')
      .select('id')
      .eq('owner_profile_id', userId)
      .limit(1)
      .maybeSingle()

    if (ownerCheckError) {
      return { ok: false, error: 'تعذر التحقق من الأنشطة المرتبطة بالمستخدم' }
    }
    if (ownedBusiness) {
      return {
        ok: false,
        error: 'لا يمكن تغيير دور التاجر المرتبط بنشاط. انقل ملكية النشاط أو فك ربطه أولًا.',
      }
    }
  }

  // Upsert changes the role atomically; do not delete the old role first.
  const { error: updateError } = await admin
    .from('user_roles')
    .upsert({ user_id: userId, role: parsed.data }, { onConflict: 'user_id' })

  if (updateError) {
    return { ok: false, error: 'تعذر حفظ الدور الجديد — لم يتم تغيير الدور الحالي' }
  }

  await logAudit(admin, {
    actorUserId: ctx.userId,
    action: 'user.role.change',
    entityType: 'profile',
    entityId: userId,
    metadata: { from: targetRole?.role ?? null, to: parsed.data },
  })

  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
  revalidateTag('admin-badges', 'default')
  return { ok: true }
}

// ─── Adjust internal participation points (legacy trust_score field) ───

const trustSchema = z.object({
  delta: z.coerce.number().int().min(-100).max(100),
  reason: z.string().min(3).max(200),
})

export async function adjustTrust(userId: string, formData: FormData): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const parsed = trustSchema.safeParse({
    delta: Number(formData.get('delta') ?? 0),
    reason: String(formData.get('reason') ?? '').trim(),
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة' }
  }

  // جيب القيمة الحالية
  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('trust_score')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  const current = (profile.trust_score as number) ?? 0
  const next = Math.max(0, Math.min(100, current + parsed.data.delta))

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ trust_score: next, trust_updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) return { ok: false, error: 'تعذر تحديث نقاط المشاركة. حاول مرة أخرى.' }

  // سجل في audit
  await ctx.supabase.from('audit_logs').insert({
    actor_user_id: ctx.userId,
    action: 'adjust_trust',
    entity_type: 'profile',
    entity_id: userId,
    metadata: { delta: parsed.data.delta, from: current, to: next, reason: parsed.data.reason },
  })

  revalidatePath('/admin/users')
  return { ok: true }
}

// ─── Premium Toggle ───

export async function togglePremium(userId: string): Promise<Result> {
  const ctx = await requireAdmin()
  if (!ctx.ok) return ctx

  const { data: profile } = await ctx.supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', userId)
    .maybeSingle()

  if (!profile) return { ok: false, error: 'المستخدم مش موجود' }

  const next = !profile.is_premium
  const until = next ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null

  const { error } = await ctx.supabase
    .from('profiles')
    .update({ is_premium: next, premium_until: until })
    .eq('id', userId)

  if (error) return { ok: false, error: 'تعذر تحديث حالة التميز. حاول مرة أخرى.' }

  revalidatePath('/admin/users')
  return { ok: true }
}

// ═══════════════════════════════════════════════════════════
// Standing Cockpit Actions (Admin Only)
// ═══════════════════════════════════════════════════════════

export async function manageStandingAction(formData: FormData) {
  const userId = formData.get('userId') as string
  const action = formData.get('action') as string // 'pardon', 'warn', 'restrict', 'suspend'
  const reason = formData.get('reason') as string
  const durationDays = parseInt(formData.get('durationDays') as string || '0', 10)

  const supabase = await createClient()
  
  // حساب تاريخ الانتهاء لو مؤقت
  let expiresAt = null
  if (durationDays > 0) {
    expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + durationDays)
  }

  // تحديد الحالة الجديدة بناءً على الإجراء
  let newStanding = 'good'
  if (action === 'warn') newStanding = 'warning'
  if (action === 'restrict') newStanding = 'restricted'
  if (action === 'suspend') newStanding = 'suspended'
  if (action === 'pardon') {
    newStanding = 'good'
    expiresAt = null // إعفاء بيمسح التاريخ
  }

  const { data, error } = await supabase.rpc('admin_manage_standing', {
    p_user_id: userId,
    p_action: action,
    p_new_standing: newStanding,
    p_expires_at: expiresAt ? expiresAt.toISOString() : null,
    p_reason: reason || 'تعديل يدوي من الإدارة'
  })

  if (error) {
    console.error('Standing action failed:', error)
    return { ok: false, error: 'حدث خطأ أثناء تنفيذ الإجراء' }
  }

  revalidatePath(`/admin/users/${userId}`)
  return { ok: true }
}
