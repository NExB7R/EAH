'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function searchUsers(query: string) {
  if (!query || query.trim().length < 2) {
    return { ok: false, users: [], error: 'اكتب 2 حروف على الأقل' }
  }
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_search_user', { p_query: query.trim() })
  if (error) return { ok: false, users: [], error: error.message }
  const r = data as any
  return { ok: r?.ok ?? false, users: r?.users ?? [], error: r?.reason === 'not_admin' ? 'صلاحيات' : undefined }
}

export async function adjustPoints(userId: string, delta: number, reason: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('admin_adjust_points', {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
  })
  if (error) return { ok: false, error: error.message }
  const r = data as any
  if (!r?.ok) {
    const msgs: Record<string, string> = {
      not_admin: 'مش عندك صلاحيات',
      zero_delta: 'لازم تغيير أكبر من صفر',
      reason_required: 'اكتب سبب التعديل',
      user_not_found: 'المستخدم مش موجود',
    }
    return { ok: false, error: msgs[r?.reason] ?? 'خطأ غير معروف' }
  }
  revalidatePath('/admin/points')
  return { ok: true, balance: r.balance as number }
}
