import { redirect } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// EAH — /admin/reports → redirect to moderation
// ═══════════════════════════════════════════════════════════

export default function AdminReportsRedirect() {
  redirect('/admin/moderation?tab=reports')
}
