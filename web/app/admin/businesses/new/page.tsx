import Link from 'next/link'
import { ArrowLeftIcon } from '@/components/icons'
import { getBusinessOwnerCandidates } from '@/lib/data/admin-business'
import NewBusinessWizard, { type OwnerOption } from './new-business-wizard'
import fsStyles from './fullscreen.module.css'

export const dynamic = 'force-dynamic'

// ═══════════════════════════════════════════════════════════
// EAH — New Business Page (fullscreen wizard)
// UI-02: renders as a full-viewport overlay to hide admin
// sidebar/nav — wizard gets full width, focused experience.
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
    <div className={fsStyles.overlay}>
      <header className={fsStyles.header}>
        <Link href="/admin/businesses" className={fsStyles.exitLink}>
          <ArrowLeftIcon size={14} />
          <span>رجوع للقائمة</span>
        </Link>
        <span className={fsStyles.title}>إضافة نشاط جديد</span>
        <span className={fsStyles.subtitle}>4 خطوات سريعة</span>
      </header>
      <div className={fsStyles.container}>
        <NewBusinessWizard owners={ownerOptions} />
      </div>
    </div>
  )
}
