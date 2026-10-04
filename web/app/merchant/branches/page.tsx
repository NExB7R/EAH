import { redirect } from 'next/navigation'
import { MapPinIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMyBranches } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BranchForm from './branch-form'
import BranchRow from './branch-row'
import styles from './branches.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantBranchesPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/branches')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const branches = await getMyBranches(business.id)

  return (
    <div>
      <AccountPageHeader
        title="الفروع"
        description={`${branches.length} فرع — أول فرع بيبقى الأساسي تلقائياً`}
      />

      <BranchForm />

      {branches.length === 0 ? (
        <EmptyState
          Icon={MapPinIcon}
          title="مفيش فروع"
          description="ضيف فرع الأول — لو عندك أكتر من مكان"
        />
      ) : (
        <div className={styles.list}>
          {branches.map((b) => (
            <BranchRow key={b.id} branch={b} />
          ))}
        </div>
      )}
    </div>
  )
}
