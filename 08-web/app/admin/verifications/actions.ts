'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { auditLog } from '@/lib/admin/audit'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')
  const { data: role } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (role?.role !== 'super_admin') throw new Error('Unauthorized')
  return { supabase, user: userData.user }
}

export async function reviewVerification(
  requestId: string,
  action: 'approve' | 'reject',
  note: string
): Promise<{ ok: boolean; message?: string }> {
  const { supabase, user } = await requireAdmin()

  const { data: req } = await supabase
    .from('verification_requests')
    .select('id,user_id,real_name,status')
    .eq('id', requestId)
    .maybeSingle()

  if (!req) return { ok: false, message: 'الطلب مش موجود' }
  if (req.status !== 'pending') return { ok: false, message: 'الطلب اتراجع بالفعل' }

  const status = action === 'approve' ? 'approved' : 'rejected'

  const { error } = await supabase
    .from('verification_requests')
    .update({
      status,
      admin_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { ok: false, message: error.message }

  if (action === 'approve') {
    await supabase
      .from('profiles')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', req.user_id)
  }

  // إشعار للمستخدم
  await supabase.from('notifications').insert({
    user_id: req.user_id,
    type: 'verification',
    title: action === 'approve' ? ' تم توثيق حسابك' : ' تم رفض طلب التوثيق',
    body: note || (action === 'approve' ? 'حسابك موثق دلوقتي' : 'للأسف طلبك مرفوض'),
    link: '/account',
  })

  await auditLog({
    action: action === 'approve' ? 'review.approve' : 'review.reject',
    entityType: 'verification_request',
    entityId: requestId,
    after: { status, note },
  })

  revalidatePath('/admin/verifications')
  revalidatePath('/admin')
  revalidatePath('/account')
  return { ok: true }
}
