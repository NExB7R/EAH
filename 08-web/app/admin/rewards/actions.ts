'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')
  const { data: r } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', u.user.id)
    .maybeSingle()
  if (r?.role !== 'super_admin' && r?.role !== 'admin') throw new Error('Unauthorized')
  return { supabase, user: u.user }
}

export async function createReward(formData: FormData) {
  const { supabase } = await requireAdmin()
  const valueRaw = String(formData.get('value') ?? '').trim()

  await supabase.from('reward_catalog').insert({
    title: String(formData.get('title') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim() || null,
    emoji: String(formData.get('emoji') ?? '🎁').trim() || '🎁',
    category: String(formData.get('category') ?? 'voucher'),
    value: valueRaw ? Number(valueRaw) : null,
    value_type: String(formData.get('value_type') ?? 'none'),
    points_cost: Number(formData.get('points_cost') ?? 100),
    min_streak: Number(formData.get('min_streak') ?? 0),
    stock: formData.get('stock') ? Number(formData.get('stock')) : null,
    is_active: true,
  })

  revalidatePath('/admin/rewards')
  revalidatePath('/account/points')
}

export async function toggleReward(id: string, active: boolean) {
  const { supabase } = await requireAdmin()
  await supabase
    .from('reward_catalog')
    .update({ is_active: active, updated_at: new Date().toISOString() })
    .eq('id', id)
  revalidatePath('/admin/rewards')
  revalidatePath('/account/points')
}

export async function deleteReward(id: string) {
  const { supabase } = await requireAdmin()
  await supabase.from('reward_catalog').delete().eq('id', id)
  revalidatePath('/admin/rewards')
  revalidatePath('/account/points')
}

export async function reviewRedemption(
  id: string,
  decision: 'approved' | 'rejected' | 'delivered',
  note?: string,
  voucherCode?: string
) {
  const { supabase, user } = await requireAdmin()

  const { data: rd } = await supabase
    .from('reward_redemptions')
    .select('id,user_id,reward_id,points_spent,status')
    .eq('id', id)
    .maybeSingle()
  if (!rd) return { ok: false, error: 'not_found' }

  const { error } = await supabase
    .from('reward_redemptions')
    .update({
      status: decision,
      admin_note: note?.trim() || null,
      voucher_code: voucherCode?.trim() || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }
  revalidatePath('/admin/rewards')
  return { ok: true }
}

export async function updateReferralSettings(formData: FormData) {
  const { supabase } = await requireAdmin()
  await supabase
    .from('referral_settings')
    .update({
      referrer_bonus: Number(formData.get('referrer_bonus') ?? 50),
      referred_bonus: Number(formData.get('referred_bonus') ?? 25),
      min_days_between: Number(formData.get('min_days_between') ?? 0),
      max_referrals_per_user: formData.get('max_referrals_per_user')
        ? Number(formData.get('max_referrals_per_user'))
        : null,
      require_verification: formData.get('require_verification') === 'on',
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', 1)
  revalidatePath('/admin/referrals')
}
