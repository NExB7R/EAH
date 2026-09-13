'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')
  const { data: r } = await supabase.from('user_roles').select('role').eq('user_id', u.user.id).maybeSingle()
  if (r?.role !== 'super_admin') throw new Error('Unauthorized')
  return supabase
}

export async function createReward(formData: FormData) {
  const supabase = await requireAdmin()
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
  const supabase = await requireAdmin()
  await supabase.from('reward_catalog').update({ is_active: active, updated_at: new Date().toISOString() }).eq('id', id)
  revalidatePath('/admin/rewards')
  revalidatePath('/account/points')
}

export async function deleteReward(id: string) {
  const supabase = await requireAdmin()
  await supabase.from('reward_catalog').delete().eq('id', id)
  revalidatePath('/admin/rewards')
  revalidatePath('/account/points')
}
