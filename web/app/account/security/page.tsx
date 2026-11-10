import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { ProfileHeader } from '@/components/profile/profile-header'
import type { ProfileRole } from '@/lib/profile/role-theme'
import ChangePasswordForm from './change-password-form'

export default async function SecurityPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/security')

  const primaryRole: ProfileRole =
    session.role === 'super_admin'
      ? 'super_admin'
      : session.role === 'merchant'
        ? 'merchant'
        : session.hasActiveAds
          ? 'advertiser'
          : 'customer'

  return (
    <div>
      <ProfileHeader
        displayName={session.displayName}
        avatarUrl={session.avatarUrl}
        role={primaryRole}
        subtitle="احمي حسابك بكلمة سر قوية"
      />
      <ChangePasswordForm />
    </div>
  )
}
