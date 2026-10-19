import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import { ArrowLeftIcon } from '@/components/icons'
import { getBusinessOwnerCandidates } from '@/lib/data/admin-business'
import NewBusinessWizard, { type OwnerOption } from './new-business-wizard'
import styles from '../businesses.module.css'

export const dynamic = 'force-dynamic'

export default async function NewBusinessPage() {
  const owners = await getBusinessOwnerCandidates()

  const ownerOptions: OwnerOption[] = (
    owners as unknown as { id: string; display_name: string }[]
  ).map((o) => ({ id: o.id, display_name: o.display_name }))

  return (
    <div>
      <AccountPageHeader title="نشاط جديد" description="أضف نشاط يدوي — 4 خطوات سريعة" />

      <Link href="/admin/businesses" className={styles.backLink}>
        <ArrowLeftIcon size={14} />
        <span>رجوع للقائمة</span>
      </Link>

      <NewBusinessWizard owners={ownerOptions} />
    </div>
  )
}
