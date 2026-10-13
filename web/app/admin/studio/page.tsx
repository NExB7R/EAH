import AccountPageHeader from '@/components/account-page-header'
import { SparklesIcon } from '@/components/icons'
import { getFeatureFlags } from '@/lib/features'
import { getAppTexts } from '@/lib/data/app-texts'
import StudioTabs from './studio-tabs'
import styles from './studio.module.css'

export const dynamic = 'force-dynamic'

export default async function StudioPage() {
  const [flags, texts] = await Promise.all([getFeatureFlags(), getAppTexts()])

  return (
    <div>
      <AccountPageHeader
        title="الاستوديو"
        description="تحكم كامل في ميزات المنصة ونصوصها — من مكان واحد"
      />

      <div className={styles.intro}>
        <span className={styles.introIcon}>
          <SparklesIcon size={20} />
        </span>
        <div>
          <h3 className={styles.introTitle}>الاستوديو</h3>
          <p className={styles.introText}>
            فعّل أو أوقف أي ميزة، أو عدّل النصوص الحيوية. التغييرات بتطبق فوراً على كل المستخدمين،
            وبتتسجل في سجل التدقيق.
          </p>
        </div>
      </div>

      <StudioTabs flags={flags} texts={texts} />
    </div>
  )
}
