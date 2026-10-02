import AccountPageHeader from '@/components/account-page-header'
import { SparklesIcon } from '@/components/icons'
import { getFeatureFlags } from '@/lib/features'
import FlagsPanel from './flags-panel'
import styles from './studio.module.css'

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const flags = await getFeatureFlags()

  return (
    <div>
      <AccountPageHeader title="الاستوديو" description="تحكم كامل في ميزات المنصة — من مكان واحد" />

      <div className={styles.intro}>
        <span className={styles.introIcon}>
          <SparklesIcon size={20} />
        </span>
        <div>
          <h3 className={styles.introTitle}>الاستوديو</h3>
          <p className={styles.introText}>
            فعّل أو أوقف أي ميزة في المنصة. التغييرات بتطبق فوراً على كل المستخدمين، وبتتسجل في سجل
            التدقيق.
          </p>
        </div>
      </div>

      <FlagsPanel initial={flags} />
    </div>
  )
}
