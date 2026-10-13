import AccountPageHeader from '@/components/account-page-header'
import { createServiceClient } from '@/lib/supabase/service'
import { APP_VERSION } from '@/lib/version'
import SettingsForm from './settings-form'
import SettingsSystemInfo from './settings-system-info'

export const dynamic = 'force-dynamic'

type SiteSettings = {
  site_name: string
  support_email: string
  support_whatsapp: string
  announcement_banner: string
  maintenance_mode: boolean
  new_signups_enabled: boolean
  featured_enabled: boolean
}

const DEFAULTS: SiteSettings = {
  site_name: 'EAH',
  support_email: 'nexb7r@gmail.com',
  support_whatsapp: '201012892806',
  announcement_banner: '',
  maintenance_mode: false,
  new_signups_enabled: true,
  featured_enabled: true,
}

export default async function AdminSettingsPage() {
  const service = createServiceClient()
  const { data } = await service
    .from('app_settings')
    .select('value, updated_at')
    .eq('key', 'site')
    .maybeSingle()

  const initial = { ...DEFAULTS, ...((data?.value as Partial<SiteSettings>) ?? {}) }
  const lastUpdated = (data?.updated_at as string | undefined) ?? null

  const env = process.env.NEXT_PUBLIC_SITE_URL?.includes('vercel.app') ? 'Production' : 'Local'

  return (
    <div>
      <AccountPageHeader
        title="الإعدادات"
        description="تحكم كامل في إعدادات المنصة — التعديلات بتتسجل في سجل التدقيق"
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
