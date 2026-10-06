import { createClient } from '@/lib/supabase/server'

// ═══════════════════════════════════════════════════════════
// EAH — Referral Data
// ═══════════════════════════════════════════════════════════

export type ReferralStats = {
  total_invited: number
  signed_up: number
  first_order: number
  total_points: number
}

export type ReferralItem = {
  id: string
  display_name: string
  avatar_url: string | null
  signup_at: string
  first_order_at: string | null
  points_awarded: number
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_referral_stats', { p_user_id: userId })

  const row = (data as ReferralStats[] | null)?.[0]
  return row ?? { total_invited: 0, signed_up: 0, first_order: 0, total_points: 0 }
}

export async function getReferralList(userId: string, limit = 50): Promise<ReferralItem[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('get_referral_list', {
    p_user_id: userId,
    p_limit: limit,
  })
  return (data ?? []) as ReferralItem[]
}
