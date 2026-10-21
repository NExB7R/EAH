import { redirect } from 'next/navigation'
import AccountPageHeader from '@/components/account-page-header'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import EditProfileForm from '../../account/edit/edit-form'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/admin/profile')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/admin/profile')

  const displayNameMode =
    profile.display_name_mode === 'real' ||
    profile.display_name_mode === 'alias' ||
    profile.display_name_mode === 'both' ||
    profile.display_name_mode === 'anonymous'
      ? profile.display_name_mode
      : 'real'

  return (
    <div>
      <AccountPageHeader
        title="الملف الشخصي للأدمن"
        description="عدّل بياناتك وخصوصيتك من داخل مساحة الإدارة."
      />
      <EditProfileForm
        initial={{
          displayName: profile.display_name,
          alias: profile.alias,
          gender: profile.gender,
          bio: profile.bio,
          avatarUrl: profile.avatar_url,
          displayNameMode,
          hideAvatar: profile.hide_avatar,
          hideFavorites: profile.hide_favorites,
          hideFollowing: profile.hide_following,
          role: session.role,
          phoneVerified: !!profile.phone_verified_at,
        }}
      />
    </div>
  )
}
