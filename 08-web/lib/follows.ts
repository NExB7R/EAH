import { createClient } from '@/lib/supabase-server'

export async function isFollowing(userId: string, businessId: string): Promise<boolean> {
  const sb = await createClient()
  const { data } = await sb
    .from('business_follows')
    .select('id')
    .eq('user_id', userId)
    .eq('business_id', businessId)
    .maybeSingle()
  return !!data
}

export async function getFollowerCount(businessId: string): Promise<number> {
  const sb = await createClient()
  const { data } = await sb.rpc('get_business_follower_count', { p_business: businessId })
  return (data as number) ?? 0
}

export async function getFollowerCounts(ids: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  if (!ids.length) return map
  const sb = await createClient()
  const { data } = await sb.rpc('get_follower_counts', { p_business_ids: ids })
  for (const row of (data as { business_id: string; follower_count: number }[]) ?? []) {
    map.set(row.business_id, row.follower_count)
  }
  return map
}

export async function getMyFollowingIds(userId: string): Promise<string[]> {
  const sb = await createClient()
  const { data } = await sb
    .from('business_follows')
    .select('business_id')
    .eq('user_id', userId)
  return (data ?? []).map((r) => r.business_id as string)
}
