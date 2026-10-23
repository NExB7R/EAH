import { redirect } from 'next/navigation'

type SearchParams = {
  q?: string
  action?: string
  actor?: string
}

// ═══════════════════════════════════════════════════════════════════
// Legacy /admin/audit → /admin/health?tab=audit (SPRAWL-01 merge)
// Preserves filters via query string forwarding.
// ═══════════════════════════════════════════════════════════════════

export default async function LegacyAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const qs = new URLSearchParams({ tab: 'audit' })
  if (params.q) qs.set('q', params.q)
  if (params.action) qs.set('action', params.action)
  if (params.actor) qs.set('actor', params.actor)
  redirect(`/admin/health?${qs.toString()}`)
}
