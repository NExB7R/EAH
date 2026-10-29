import { redirect } from 'next/navigation'
import AccountPageHeader from '@/components/account-page-header'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import AdminProfileForm from './admin-profile-form'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/admin/profile')
  if (session.role !== 'super_admin') redirect('/')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/admin/profile')

  return (
    <div>
      <AccountPageHeader title="بروفايلي" description="بياناتك داخل لوحة الإدارة" />
      <AdminProfileForm
        initial={{
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          role: session.role as 'admin' | 'super_admin',
          phoneVerified: !!profile.phone_verified_at,
        }}
      />
    </div>
  )
}
