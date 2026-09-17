'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'
import { IcCheckCircle } from '@/components/eah-icons'

export type ActionResult = { ok: boolean; error?: string; message?: string }

async function assertAdmin() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) throw new Error('not_authenticated')
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', auth.user.id)
    .maybeSingle()
  if (role?.role !== 'admin' && role?.role !== 'super_admin') {
    throw new Error('unauthorized')
  }
  return supabase
}

export async function reviewRequestAction(
  id: string,
  decision: 'approved' | 'rejected',
  note?: string
): Promise<ActionResult> {
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase.rpc('admin_review_business_change_request', {
      p_request_id: id,
      p_decision: decision,
      p_admin_note: note?.trim() || null,
    })
    if (error) return { ok: false, error: error.message }

    revalidatePath('/admin/change-requests')
    revalidatePath(`/admin/change-requests/${id}`)
    revalidatePath('/merchant')
    return {
      ok: true,
      message: decision === 'approved' ? 'تم الاعتماد' : 'تم الرفض',
    }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

export async function bulkApproveAction(ids: string[]): Promise<ActionResult> {
  try {
    const supabase = await assertAdmin()
    let okCount = 0
    for (const id of ids) {
      const { error } = await supabase.rpc('admin_review_business_change_request', {
        p_request_id: id,
        p_decision: 'approved',
        p_admin_note: null,
      })
      if (!error) okCount++
    }
    revalidatePath('/admin/change-requests')
    return { ok: true, message: `تم اعتماد ${okCount} طلب` }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
