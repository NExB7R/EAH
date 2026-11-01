import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SettingsIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness, getMerchantOrders } from '@/lib/data/merchant'
import { getMerchantOrderSettings } from '@/lib/data/orders-settings'
import { expireStaleOrders } from '@/lib/data/orders-expire'
import { autoDeliverDueOrders, sendFeedbackReminders } from '@/lib/data/orders-auto'
import OrderList from './order-list'
import styles from './orders.module.css'

export const dynamic = 'force-dynamic'

export default async function MerchantOrdersPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/orders')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  await Promise.all([
    expireStaleOrders(business.id),
    autoDeliverDueOrders(),
    sendFeedbackReminders(),
  ])

  const [orders, settings] = await Promise.all([
    getMerchantOrders(business.id),
    getMerchantOrderSettings(business.id),
  ])

  const isEnabled = !!settings?.orders_enabled

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>الطلبات</h1>
          <p className={styles.subtitle}>
            {orders.length.toLocaleString('ar-EG')} طلب
            {isEnabled && settings && ` · الرد خلال ${settings.deadline_minutes} دقايق`}
          </p>
        </div>
        <Link href="/merchant/orders/settings" className={styles.settingsBtn}>
          <SettingsIcon size={16} />
          <span className={styles.settingsLabel}>الإعدادات</span>
        </Link>
      </header>

      {!isEnabled && (
        <Link href="/merchant/orders/settings" className={styles.disabledBanner}>
          <span className={styles.disabledDot} aria-hidden />
          <span className={styles.disabledText}>استلام الطلبات موقوف — لن تستقبل طلبات جديدة</span>
          <span className={styles.disabledArrow}>›</span>
        </Link>
      )}

      <OrderList orders={orders} isEnabled={isEnabled} />
    </div>
  )
}
