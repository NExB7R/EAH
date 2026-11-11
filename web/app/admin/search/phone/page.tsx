import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUserSession } from '@/lib/data/user'
import AccountPageHeader from '@/components/account-page-header'
import { PhoneSearchModal } from '@/components/profile/phone-search-modal'
import styles from './phone-search-page.module.css'

export const dynamic = 'force-dynamic'

export default async function PhoneSearchPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/admin/search/phone')
  if (session.role !== 'super_admin') redirect('/')

  return (
    <div className={styles.wrap}>
      <AccountPageHeader
        title="بحث برقم كامل"
        description="بحث role-aware — سوبر أدمن يرى كل شيء، الطيار يرى المصداقية فقط"
      />
      <div className={styles.info}>
        <p>هذه الميزة ستُدمج لاحقًا مع البحث والمساعد الذكي. حاليًا متاحة من هذه الصفحة.</p>
        <Link href="/admin" className={styles.backLink}>
          ← العودة للوحة
        </Link>
      </div>
      <PhoneSearchModal onClose={() => {}} />
    </div>
  )
}
