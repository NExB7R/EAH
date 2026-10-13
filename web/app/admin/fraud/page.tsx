import { redirect } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// EAH — /admin/fraud → redirect to moderation
// ═══════════════════════════════════════════════════════════

export default function AdminFraudRedirect() {
  redirect('/admin/moderation?tab=fraud')
}
