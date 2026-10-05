import Link from 'next/link'
import AccountPageHeader from '@/components/account-page-header'
import { ArrowLeftIcon } from '@/components/icons'
import { getBusinessOwnerCandidates } from '@/lib/data/admin-business'
import BusinessForm from '../business-form'
import styles from '../businesses.module.css'

export const dynamic = 'force-dynamic'

export default async function NewBusinessPage() {
  const owners = await getBusinessOwnerCandidates()

  return (
    <div>
      <AccountPageHeader title="نشاط جديد" description="أضف نشاط يدوي باسم صاحب النشاط" />

      <Link href="/admin/businesses" className={styles.backLink}>
        <ArrowLeftIcon size={14} />
        <span>رجوع للقائمة</span>
      </Link>

      <BusinessForm owners={owners} />
    </div>
  )
}
