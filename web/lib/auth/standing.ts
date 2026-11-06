import { createClient } from '@/lib/supabase/server'

export type StandingCheck = {
  can: boolean
  standing: string
  reason: string | null
  expiresAt: string | null
}

export async function checkCanInteract(userId: string): Promise<StandingCheck> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('can_interact', { p_user_id: userId })
  if (error || !data) {
    return { can: true, standing: 'good', reason: null, expiresAt: null }
  }
  const r = data as any
  return {
    can: r.can === true,
    standing: r.standing || 'good',
    reason: r.reason || null,
    expiresAt: r.expires_at || null,
  }
}

export async function runStandingsExpiry(): Promise<number> {
  const supabase = await createClient()
  const { data } = await supabase.rpc('expire_standings')
  return (data as number) || 0
}
