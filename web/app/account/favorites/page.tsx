import { redirect } from 'next/navigation'
import { CrownGoldIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getFavorites } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import BusinessCard from '@/components/business-card'
import styles from '../account-page.module.css'

export default async function FavoritesPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/favorites')

  const favorites = await getFavorites(session.userId)

  return (
    <div>
      <AccountPageHeader
        title="المفضلات"
        description={`${favorites.length} نشاط محفوظ`}
      />
      {favorites.length === 0 ? (
        <EmptyState
          Icon={CrownGoldIcon}
          title="مفيش أنشطة محفوظة لسه"
          description="ابدأ تكتشف الأنشطة واحفظ اللي يعجبك"
          ctaHref="/explore"
          ctaLabel="اكتشف أنشطة"
        />
      ) : (
        <div className={styles.grid}>
          {favorites.map((f) => (
            <BusinessCard
              key={f.id}
              business={f.business as never}
              tone="gold"
            />
          ))}
        </div>
      )}
    </div>
  )
}
