import { redirect } from 'next/navigation'

// ═══════════════════════════════════════════════════════════
// EAH — Admin Profile
// Admins edit profile via /account/edit (shared form).
// This route exists for UX clarity — sidebar + avatar link here.
// Future: dedicated admin inline form if needed.
// ═══════════════════════════════════════════════════════════

export const dynamic = 'force-dynamic'

export default function AdminProfilePage() {
  redirect('/account/edit')
}
