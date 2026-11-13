import { getBusinessOwnerCandidates } from '@/lib/data/admin-business'
import NewBusinessWizard, { type OwnerOption } from './new-business-wizard'
import fsStyles from './fullscreen.module.css'

export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — New Business Page
// Normal flow — the platform FloatingCapsule (from admin
// layout padding 90px) is the only top bar. No overlay, no
// custom header, single page scroll.
// ═══════════════════════════════════════════════════════════

export default async function NewBusinessPage() {
  const owners = await getBusinessOwnerCandidates()

  const ownerOptions: OwnerOption[] = owners.map((owner) => ({
    id: owner.id,
    display_name: owner.display_name,
    phone: owner.phone,
    role: owner.role,
  }))

  return (
    <div className={fsStyles.container}>
      <NewBusinessWizard owners={ownerOptions} />
    </div>
  )
}
