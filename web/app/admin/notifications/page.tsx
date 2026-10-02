import { BellIcon } from '@/components/icons'
import AccountPageHeader from '@/components/account-page-header'
import { getAudienceCounts } from '@/lib/data/admin'
import Composer from './composer'
import styles from './notifications.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const audiences = await getAudienceCounts()

  return (
    <div>
      <AccountPageHeader
        title="إرسال إشعار"
        description="ابعت رسالة لكل المستخدمين أو لفئة معينة"
      />

      <section className={styles.intro}>
        <span className={styles.introIcon}>
          <BellIcon size={20} />
        </span>
        <p className={styles.introText}>
          الرسالة توصل في صفحة الإشعارات + Push فوري للمتصفح (لو مفعّل عند المستخدم).
        </p>
      </section>

      <Composer audiences={audiences} />
    </div>
  )
}
