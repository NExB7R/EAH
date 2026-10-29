import AccountPageHeader from '@/components/account-page-header'
import { APP_VERSION } from '@/lib/version'
import { getSiteSettingsForAdmin } from '@/lib/data/site-settings'
import SettingsForm from './settings-form'
import SettingsSystemInfo from './settings-system-info'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const { settings: initial, updatedAt: lastUpdated } = await getSiteSettingsForAdmin()
  const env = process.env.NEXT_PUBLIC_SITE_URL?.includes('vercel.app') ? 'Production' : 'Local'

  return (
    <div>
      <AccountPageHeader
        title="الإعدادات"
        description="تحكم في إعدادات المنصة — التعديلات بتتسجل في سجل التدقيق"
      />
      <SettingsSystemInfo
        version={APP_VERSION}
        environment={env}
        lastUpdated={lastUpdated}
        siteUrl={process.env.NEXT_PUBLIC_SITE_URL ?? '—'}
      />
      <SettingsForm initial={initial} />
    </div>
  )
}
