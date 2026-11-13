import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import AccountPageHeader from '@/components/account-page-header'
import { PhoneSearchClient } from './phone-search-client'
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
        description="سوبر أدمن يرى كل شيء — المستخدم العادي يرى المصداقية فقط"
      />
      <PhoneSearchClient />
    </div>
  )
}
