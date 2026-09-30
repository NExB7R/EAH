import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import AccountPageHeader from '@/components/account-page-header'
import ChangePasswordForm from './change-password-form'

export default async function SecurityPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/security')

  return (
    <div>
      <AccountPageHeader title="الأمان" description="احمي حسابك بكلمة سر قوية" />
      <ChangePasswordForm />
    </div>
  )
}
