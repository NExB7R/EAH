import { redirect } from 'next/navigation'
import { TagIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getMyAds, getAdSlots } from '@/lib/data/ads'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import RequestForm from './request-form'
import AdsList from './ads-list'
import type { AdRow } from './types'
import styles from './ads.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantAdsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/ads')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const [ads, slots] = await Promise.all([getMyAds(business.id), getAdSlots()])

  return (
    <div>
      <AccountPageHeader
        title="الإعلانات"
        description={`${ads.length} إعلان — طلب من الإدارة، وبعد الموافقة يظهر`}
      />

      <section className={styles.intro}>
        <span className={styles.introIcon}>
          <TagIcon size={20} />
        </span>
        <p className={styles.introText}>
          الإعلانات بتظهر في أماكن محددة في المنصة. طلبك يروح للمراجعة الأول.
        </p>
      </section>

      <RequestForm slots={slots} />

      {ads.length === 0 ? (
        <EmptyState Icon={TagIcon} title="مفيش إعلانات" description="اطلب أول إعلان وشوف الفرق" />
      ) : (
        <AdsList ads={ads as AdRow[]} />
      )}
    </div>
  )
}
