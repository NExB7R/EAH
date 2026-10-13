import { redirect } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// EAH — /admin/announcements → redirect to merged page
// ═══════════════════════════════════════════════════════════

export default function AdminAnnouncementsRedirect() {
  redirect('/admin/notifications?tab=announcements')
}
