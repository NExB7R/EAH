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

export async function updateReferralSettings(formData: FormData) {
  const { supabase } = await requireAdmin()
  const maxRaw = formData.get('max_referrals_per_user')
  await supabase
    .from('referral_settings')
    .update({
      referrer_bonus: Number(formData.get('referrer_bonus') ?? 50),
      referred_bonus: Number(formData.get('referred_bonus') ?? 25),
      min_days_between: Number(formData.get('min_days_between') ?? 0),
      max_referrals_per_user: maxRaw ? Number(maxRaw) : null,
      require_verification: formData.get('require_verification') === 'on',
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', 1)
  revalidatePath('/admin/referrals')
  return { ok: true }
}
