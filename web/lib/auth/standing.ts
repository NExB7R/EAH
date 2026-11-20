import { createClient } from '@/lib/supabase/server'

export type StandingCheck = {
  can: boolean
  standing: string
  reason: string | null
  expiresAt: string | null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

export async function checkCanInteract(userId: string): Promise<StandingCheck> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('can_interact', { p_user_id: userId })

  if (error || !data) {
    return {
      can: false,
      standing: 'restricted',
      reason: 'تعذر التحقق من حالة الالتزام',
      expiresAt: null,
    }
  }

  const result = asRecord(data)
  if (!result) {
    return {
      can: false,
      standing: 'restricted',
      reason: 'استجابة حالة الالتزام غير صالحة',
      expiresAt: null,
    }
  }

  return {
    can: result.can === true,
    standing: typeof result.standing === 'string' ? result.standing : 'good',
    reason: typeof result.reason === 'string' ? result.reason : null,
    expiresAt: typeof result.expires_at === 'string' ? result.expires_at : null,
  }
}

export async function runStandingsExpiry(): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('expire_standings')
  if (error) return 0
  return typeof data === 'number' && Number.isFinite(data) ? data : 0
}
