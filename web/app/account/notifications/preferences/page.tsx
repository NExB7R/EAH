import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import AccountPageHeader from '@/components/account-page-header'
import PrefsForm from './prefs-form'
import styles from './preferences.module.css'

export const dynamic = 'force-dynamic'

export default async function PreferencesPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/notifications/preferences')

  return (
    <div>
      <AccountPageHeader
        title="تفضيلات الإشعارات"
        description="تحكم كامل في نوع الإشعارات اللي توصلك"
      />
      <PrefsForm />
    </div>
  )
}
