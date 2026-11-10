import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import { ProfileHeader } from '@/components/profile/profile-header'
import type { BadgeKind, ProfileRole } from '@/lib/profile/role-theme'
import EditProfileForm from './edit-form'

export const dynamic = 'force-dynamic'

export default async function EditPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/edit')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/account/edit')

  const role = session.role
  const displayNameMode =
    profile.display_name_mode === 'real' ||
    profile.display_name_mode === 'alias' ||
    profile.display_name_mode === 'both' ||
    profile.display_name_mode === 'anonymous'
      ? profile.display_name_mode
      : 'real'

  const primaryRole: ProfileRole =
    session.role === 'super_admin'
      ? 'super_admin'
      : session.role === 'merchant'
        ? 'merchant'
        : session.hasActiveAds
          ? 'advertiser'
          : 'customer'

  const headerBadges: BadgeKind[] = []
  if (session.isVerified) headerBadges.push('verified')
  if (session.isPaidMember) headerBadges.push('premium')

  return (
    <div>
      <ProfileHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        role={primaryRole}
        subtitle="تعديل بياناتك وخصوصيتك"
        badges={headerBadges}
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
          role,
          isVerified: session.isVerified,
          isPaidMember: session.isPaidMember,
          phoneVerified: !!profile.phone_verified_at,
        }}
      />
    </div>
  )
}
