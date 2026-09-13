'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { auditLog } from '@/lib/admin/audit'

type ActionState = { ok: boolean; message?: string }

async function assertAdmin() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')
  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') throw new Error('Unauthorized')
  return { supabase, user: userData.user }
}

export async function banUser(userId: string, days: number, reason: string): Promise<ActionState> {
  const { supabase, user } = await assertAdmin()
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({ banned_until: until, ban_reason: reason || null })
    .eq('id', userId)

  if (error) return { ok: false, message: error.message }

  await auditLog({
    action: 'business.update',
    entityType: 'user_ban',
    entityId: userId,
    after: { banned_until: until, reason, days },
    metadata: { actor_email: user.email ?? null, kind: 'ban' },
  })

  revalidatePath('/admin/users')
  return { ok: true, message: `تم الحظر لـ ${days} يوم` }
}

export async function unbanUser(userId: string): Promise<ActionState> {
  const { supabase, user } = await assertAdmin()

  const { error } = await supabase
    .from('profiles')
    .update({ banned_until: null, ban_reason: null })
    .eq('id', userId)

  if (error) return { ok: false, message: error.message }

  await auditLog({
    action: 'business.update',
    entityType: 'user_ban',
    entityId: userId,
    metadata: { actor_email: user.email ?? null, kind: 'unban' },
  })

  revalidatePath('/admin/users')
  return { ok: true, message: 'تم فك الحظر' }
}

export async function setUserRole(userId: string, role: 'customer' | 'merchant' | 'admin'): Promise<ActionState> {
  const { supabase, user } = await assertAdmin()

  // نجيب الدور القديم
  const { data: oldRole } = await supabase
    .from('user_roles').select('role').eq('user_id', userId).maybeSingle()

  const { error } = await supabase
    .from('user_roles')
    .update({ role })
    .eq('user_id', userId)

  if (error) return { ok: false, message: error.message }

  await auditLog({
    action: 'business.update',
    entityType: 'user_role',
    entityId: userId,
    before: { role: oldRole?.role },
    after: { role },
    metadata: { actor_email: user.email ?? null, kind: 'role_change' },
  })

  revalidatePath('/admin/users')
  return { ok: true, message: 'تم تحديث الدور' }
}
