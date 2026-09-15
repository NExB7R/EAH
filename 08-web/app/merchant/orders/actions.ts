'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

type ActionResult = { ok: boolean; message?: string; error?: string }

const VALID = ['sent', 'seen', 'accepted', 'rejected', 'delivered', 'cancelled'] as const
type Status = typeof VALID[number]

async function assertOwner(orderId: string) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) throw new Error('unauthorized')

  const { data: order } = await supabase
    .from('order_requests')
    .select('id,business_id')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) throw new Error('not_found')

  const { data: biz } = await supabase
    .from('businesses')
    .select('owner_profile_id')
    .eq('id', order.business_id)
    .maybeSingle()

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  const isOwner = biz?.owner_profile_id === userData.user.id
  const isAdmin = role?.role === 'super_admin'
  if (!isOwner && !isAdmin) throw new Error('forbidden')

  return supabase
}

export async function updateOrderStatus(orderId: string, status: Status): Promise<ActionResult> {
  try {
    if (!VALID.includes(status)) return { ok: false, error: 'invalid_status' }
    const supabase = await assertOwner(orderId)
    const { error } = await supabase
      .from('order_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
    if (error) return { ok: false, error: error.message }
    revalidatePath('/merchant/orders')
    return { ok: true, message: 'تم تحديث الحالة' }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' }
  }
}
