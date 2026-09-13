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
  return { supabase }
}

export async function setReviewStatus(reviewId: string, status: 'approved' | 'rejected' | 'hidden'): Promise<ActionState> {
  const { supabase } = await assertAdmin()
  const { error } = await supabase
    .from('business_reviews')
    .update({ status })
    .eq('id', reviewId)
  if (error) return { ok: false, message: error.message }
  await auditLog({
    action: status === 'approved' ? 'review.approve' : status === 'rejected' ? 'review.reject' : 'review.hide',
    entityType: 'business_review',
    entityId: reviewId,
    after: { status },
  })
  revalidatePath('/admin/reviews')
  return { ok: true }
}

export async function deleteReview(reviewId: string): Promise<ActionState> {
  const { supabase } = await assertAdmin()
  const { error } = await supabase
    .from('business_reviews')
    .delete()
    .eq('id', reviewId)
  if (error) return { ok: false, message: error.message }
  await auditLog({ action: 'review.delete', entityType: 'business_review', entityId: reviewId })
  revalidatePath('/admin/reviews')
  return { ok: true }
}
