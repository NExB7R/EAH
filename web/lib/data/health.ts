import { createServiceClient } from '@/lib/supabase/service'
import { requireAdmin } from '@/lib/auth/admin'

// ═══════════════════════════════════════════════════════════
// EAH — System Health data
// ═══════════════════════════════════════════════════════════

export type SystemError = {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  path: string | null
  message: string
  user_id: string | null
  metadata: Record<string, unknown>
  resolved_at: string | null
  created_at: string
}

export type HealthSummary = {
  last24h: number
  last7d: number
  unresolved: number
  critical24h: number
  topPaths: { path: string; count: number }[]
}

export async function getHealthSummary(): Promise<HealthSummary> {
  const admin = await requireAdmin()
  if (!admin.ok) {
    return { last24h: 0, last7d: 0, unresolved: 0, critical24h: 0, topPaths: [] }
  }

  const supabase = createServiceClient()
  const now = Date.now()
  const d1 = new Date(now - 24 * 60 * 60 * 1000).toISOString()
  const d7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [r24, r7, unresolved, critical] = await Promise.all([
    supabase
      .from('system_errors')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d1),
    supabase
      .from('system_errors')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', d7),
    supabase
      .from('system_errors')
      .select('id', { count: 'exact', head: true })
      .is('resolved_at', null),
    supabase
      .from('system_errors')
      .select('id', { count: 'exact', head: true })
      .eq('severity', 'critical')
      .gte('created_at', d1),
  ])

  // top paths (24h)
  const { data: pathsRaw } = await supabase
    .from('system_errors')
    .select('path')
    .gte('created_at', d1)
    .not('path', 'is', null)
    .limit(500)

  const counts = new Map<string, number>()
  for (const row of pathsRaw ?? []) {
    const p = (row as { path: string }).path
    if (p) counts.set(p, (counts.get(p) ?? 0) + 1)
  }
  const topPaths = Array.from(counts.entries())
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    last24h: r24.count ?? 0,
    last7d: r7.count ?? 0,
    unresolved: unresolved.count ?? 0,
    critical24h: critical.count ?? 0,
    topPaths,
  }
}

export async function getRecentErrors(limit = 50, onlyUnresolved = false): Promise<SystemError[]> {
  const admin = await requireAdmin()
  if (!admin.ok) return []

  const supabase = createServiceClient()
  let q = supabase
    .from('system_errors')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (onlyUnresolved) q = q.is('resolved_at', null)
  const { data } = await q
  return (data ?? []) as SystemError[]
}
