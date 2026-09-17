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

export async function reviewMerchantApp(
  id: string,
  decision: 'approved' | 'rejected',
  note?: string
): Promise<ActionResult> {
  try {
    const supabase = await assertAdmin()
    const { error } = await supabase
      .from('merchant_applications')
      .update({ status: decision, admin_note: note?.trim() || null })
      .eq('id', id)
      .eq('status', 'pending')
    if (error) return { ok: false, error: error.message }
    revalidatePath('/admin/merchants')
    revalidatePath('/admin')
    return {
      ok: true,
      message: decision === 'approved' ? 'تم القبول' : 'تم الرفض',
    }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}
