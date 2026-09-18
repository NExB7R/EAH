import { createClient } from '@/lib/supabase-server'

export type TierCode = 'bronze' | 'silver' | 'gold'

export type LoyaltyTier = {
  code: TierCode
  name_ar: string
  min_points: number
  perks: string[]
  display_order: number
}

export type MyLoyalty = {
  ok: boolean
  points: number
  tier: TierCode
  next_tier: TierCode | null
  next_name: string | null
  points_to_next: number
}

export const TIER_COLORS: Record<TierCode, { from: string; to: string; ring: string }> = {
  bronze: { from: '#b87333', to: '#7c4a1e', ring: '#b87333' },
  silver: { from: '#c0c0c0', to: '#8a8a8a', ring: '#c0c0c0' },
  gold:   { from: '#f5c542', to: '#b8860b', ring: '#f5c542' },
}

export const TIER_ICON: Record<TierCode, string> = {
  bronze: '🥉', silver: '🥈', gold: '🥇',
}

export async function getTiers(): Promise<LoyaltyTier[]> {
  const sb = await createClient()
  const { data } = await sb
    .from('loyalty_tiers')
    .select('*')
    .order('display_order', { ascending: true })
  return (data ?? []) as LoyaltyTier[]
}

export async function getMyLoyalty(): Promise<MyLoyalty | null> {
  const sb = await createClient()
  const { data } = await sb.rpc('get_my_loyalty')
  if (!data || !(data as { ok: boolean }).ok) return null
  return data as MyLoyalty
}
