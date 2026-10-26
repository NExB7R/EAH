import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeftIcon } from '@/components/icons'
import { getUserSession } from '@/lib/data/user'
import { getMyBusiness } from '@/lib/data/merchant'
import { getMerchantOrderSettings } from '@/lib/data/orders-settings'
import OrderSettingsCard from './order-settings-card'
import styles from './settings.module.css'

export const dynamic = 'force-dynamic'

type Status = 'active' | 'suspended' | 'offline' | 'disabled' | 'not-authorized'

function computeStatus(
  settings: {
    admin_enabled: boolean
    orders_enabled: boolean
    offline_mode: boolean
    offline_until: string | null
    suspended_until: string | null
  } | null,
): Status {
  if (!settings || !settings.admin_enabled) return 'not-authorized'
  if (!settings.orders_enabled) return 'disabled'
  const now = Date.now()
  if (settings.suspended_until && new Date(settings.suspended_until).getTime() > now) {
    return 'suspended'
  }
  if (
    settings.offline_mode &&
    (!settings.offline_until || new Date(settings.offline_until).getTime() > now)
  ) {
    return 'offline'
  }
  return 'active'
}

export default async function MerchantOrderSettingsPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/merchant/orders/settings')

  const business = await getMyBusiness(session.userId)
  if (!business) redirect('/merchant')

  const storedSettings = await getMerchantOrderSettings(business.id)
  const settings = storedSettings ?? {
    business_id: business.id,
    admin_enabled: false,
    orders_enabled: false,
    deadline_minutes: 10,
    delivery_eta_minutes: null,
    offline_mode: false,
    offline_until: null,
    auto_accept: false,
    missed_count_today: 0,
    missed_count_week: 0,
    last_missed_at: null,
    suspended_until: null,
    suspension_reason: null,
  }
  const status = computeStatus(settings)

  return (
    <div className={styles.page}>
      <Link href="/merchant/orders" className={styles.back}>
        <ArrowLeftIcon size={13} />
        <span>الطلبات</span>
      </Link>

      <OrderSettingsCard
        status={status}
        settings={{
          admin_enabled: settings.admin_enabled,
          orders_enabled: settings.orders_enabled,
          deadline_minutes: settings.deadline_minutes,
          delivery_eta_minutes: settings.delivery_eta_minutes,
          offline_mode: settings.offline_mode,
          offline_until: settings.offline_until,
          suspended_until: settings.suspended_until,
          suspension_reason: settings.suspension_reason,
        }}
      />
    </div>
  )
}
