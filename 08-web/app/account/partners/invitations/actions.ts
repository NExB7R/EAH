'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase-server'

export async function acceptInvitation(partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('accept_partner_invitation', { p_partner_id: partnerId })
  if (error) return { ok: false, message: error.message }
  const r = data as any
  if (!r?.ok) return { ok: false, message: 'مش ممكن تقبل الدعوة دي' }
  revalidatePath('/account/partners/invitations')
  revalidatePath('/merchant')
  return { ok: true }
}

export async function rejectInvitation(partnerId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('reject_partner_invitation', { p_partner_id: partnerId })
  if (error) return { ok: false, message: error.message }
  const r = data as any
  if (!r?.ok) return { ok: false, message: 'مش ممكن ترفض الدعوة دي' }
  revalidatePath('/account/partners/invitations')
  return { ok: true }
}
