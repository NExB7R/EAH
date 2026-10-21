import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — Fraud Data
// ═══════════════════════════════════════════════════════════

export type FlaggedReview = {
  id: string
  business_id: string
  business_name: string
  business_slug: string
  comment: string | null
  flagged_reason: string | null
  created_at: string
}

export type TrustEvent = {
  id: string
  entity_type: string
  entity_id: string
  event_type: string
  delta: number
  score_before: number
  score_after: number
  metadata: Record<string, unknown>
  created_at: string
}

export type FlaggedUser = {
  id: string
  display_name: string
  phone: string | null
  wanted_level: number
  trust_score: number
  banned_until: string | null
}

// ─── التقييمات المُعلّمة (RPC) ───
export async function getFlaggedReviews(): Promise<FlaggedReview[]> {
  const access = await requireAdmin()
  if (!access.ok) return []

  const supabase = access.supabase
  const { data, error } = await supabase.rpc('get_flagged_reviews')
  if (error) return []
  return (data ?? []) as FlaggedReview[]
}

// ─── أحداث trust الأخيرة ───
export async function getRecentTrustEvents(limit = 50): Promise<TrustEvent[]> {
  const access = await requireAdmin()
  if (!access.ok) return []

  const supabase = access.supabase
  const { data } = await supabase
    .from('trust_events')
    .select(
      'id, entity_type, entity_id, event_type, delta, score_before, score_after, metadata, created_at',
    )
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(100, Math.trunc(limit) || 50)))
  return (data ?? []) as TrustEvent[]
}

// ─── المستخدمين المبلغ عنهم (داخلي) ───
export async function getFlaggedUsers(limit = 30): Promise<FlaggedUser[]> {
  const access = await requireAdmin()
  if (!access.ok) return []

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, phone, wanted_level, trust_score, banned_until')
    .gt('wanted_level', 0)
    .order('wanted_level', { ascending: false })
    .order('trust_score', { ascending: true })
    .limit(Math.max(1, Math.min(100, Math.trunc(limit) || 30)))
  return (data ?? []) as FlaggedUser[]
}

// ─── إحصائيات fraud ───
export type FraudStats = {
  flagged: number
  wanted: number
  banned: number
  trustEvents24h: number
}

export async function getFraudStats(): Promise<FraudStats> {
  const access = await requireAdmin()
  if (!access.ok) return { flagged: 0, wanted: 0, banned: 0, trustEvents24h: 0 }

  const supabase = createServiceClient()
  const day = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [flagged, wanted, banned, events] = await Promise.all([
    supabase
      .from('business_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .not('flagged_reason', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('wanted_level', 0),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('banned_until', new Date().toISOString()),
    supabase
      .from('trust_events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', day),
  ])

  return {
    flagged: flagged.count ?? 0,
    wanted: wanted.count ?? 0,
    banned: banned.count ?? 0,
    trustEvents24h: events.count ?? 0,
  }
}

// ─── IPs فيها 3+ حسابات (Multi-Account) ───
export type MultiAccountIp = {
  ip_hash_prefix: string
  accounts_count: number
  latest_signup: string
}

export async function getMultiAccountIps(days = 30): Promise<MultiAccountIp[]> {
  // Service role required: get_multi_account_ips was REVOKE'd from authenticated
  // (DB-04 security fix — exposes fraud IP data). Authorize at the data boundary.
  const access = await requireAdmin()
  if (!access.ok) return []

  const supabase = createServiceClient()
  const safeDays = Math.max(1, Math.min(90, Math.trunc(days) || 30))
  const { data, error } = await supabase.rpc('get_multi_account_ips', { p_days: safeDays })
  if (error) return []
  return (data ?? []) as MultiAccountIp[]
}
