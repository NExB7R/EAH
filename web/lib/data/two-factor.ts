import 'server-only'
import { createServiceClient } from '@/lib/supabase/service'

export type TwoFactorState =
  { enabled: false } | { enabled: true; enabled_at: string; backup_codes_remaining: number }

export async function getTwoFactorState(userId: string): Promise<TwoFactorState> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('user_2fa')
    .select('enabled_at, backup_codes')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data?.enabled_at) return { enabled: false }
  return {
    enabled: true,
    enabled_at: data.enabled_at,
    backup_codes_remaining: (data.backup_codes as string[] | null)?.length ?? 0,
  }
}
