import { redirect } from 'next/navigation'
import { StoreIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getFollowing } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BusinessCard from '@/components/business-card'
import styles from '../account-page.module.css'

export default async function FollowingPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/following')

  const following = await getFollowing(session.userId)

  return (
    <div>
      <AccountPageHeader
        title="المتابعات"
        description={`${following.length} نشاط بتتابعه`}
      />
      {following.length === 0 ? (
        <EmptyState
          Icon={StoreIcon}
          title="مفيش متابعات لسه"
          description="تابع الأنشطة اللي بتحبها وهتوصلك أخبارهم"
          ctaHref="/explore"
          ctaLabel="اكتشف أنشطة"
        />
      ) : (
        <div className={styles.grid}>
          {following.map((f) => (
            <BusinessCard
              key={f.id}
              business={f.business as never}
              tone="purple"
            />
          ))}
        </div>
      )}
    </div>
  )
}
