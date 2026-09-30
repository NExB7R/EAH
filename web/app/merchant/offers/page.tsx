import { redirect } from 'next/navigation'
import { GiftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMySubscription } from '@/lib/data/merchant'
import AccountPageHeader from '@/components/account-page-header'
import PaidGate from '@/components/paid-gate'
import styles from './offers.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantOffersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/offers')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const subscription = await getMySubscription(business.id)
  const planCode = subscription?.plan?.code ?? 'basic'
  const hasAccess = planCode !== 'basic' && subscription?.status === 'active'

  return (
    <div>
      <AccountPageHeader title="العروض" description="اعمل عروض لجذب العملاء" />

      <PaidGate
        hasAccess={hasAccess}
        featureName="العروض والكوبونات"
        featureDesc="اعمل عروض مخصصة، كوبونات خصم، وعروض موسمية — كلها متاحة في الباقة المميزة."
        requiredPlan="الباقة المميزة"
      >
        <div className={styles.previewContent}>
          <span className={styles.previewIcon}>
            <GiftIcon size={32} />
          </span>
          <h3 className={styles.previewTitle}>مثال: كوبون خصم 15%</h3>
          <p className={styles.previewDesc}>صالح لآخر 3 أيام — لكل العملاء</p>
          <div className={styles.previewStats}>
            <span>25 استخدام</span>
            <span>·</span>
            <span>12 يوم متبقي</span>
          </div>
        </div>
      </PaidGate>
    </div>
  )
}
