import { createClient } from '@/lib/supabase/server'
import AccountPageHeader from '@/components/account-page-header'
import EmptyState from '@/components/empty-state'
import { ShieldCheckIcon } from '@/components/icons'

export const dynamic = 'force-dynamic'

export default async function Page() {
  return (
    <div>
      <AccountPageHeader title="reports" description="قريب — قيد التطوير" />
      <EmptyState Icon={ShieldCheckIcon} title="قريب" description="هذه الصفحة قيد التطوير" />
    </div>
  )
}
