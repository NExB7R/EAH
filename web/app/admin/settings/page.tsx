import AccountPageHeader from '@/components/account-page-header'
import { createServiceClient } from '@/lib/supabase/service'
import SettingsForm from './settings-form'

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
    .select('value')
    .eq('key', 'site')
    .maybeSingle()

  const initial = { ...DEFAULTS, ...((data?.value as Partial<SiteSettings>) ?? {}) }

  return (
    <div>
      <AccountPageHeader title="الإعدادات" description="تحكم كامل في إعدادات المنصة — بحذر" />
      <SettingsForm initial={initial} />
    </div>
  )
}
