import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import { getUserAuditEvents } from '@/lib/data/audit'
import { getMyPrivacySettings } from '@/lib/data/privacy'
import { PrivacySection } from '@/components/account/privacy-section'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileTabs } from '@/components/profile/profile-tabs'
import type { BadgeKind } from '@/lib/profile/role-theme'
import AdminProfileForm from './admin-profile-form'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/admin/profile')
  if (session.role !== 'super_admin') redirect('/')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/admin/profile')
  const events = await getUserAuditEvents(30)
  const privacy = await getMyPrivacySettings()

  const badges: BadgeKind[] = []
  if (profile.phone_verified_at) badges.push('verified')
  if (profile.is_premium) badges.push('premium')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        minHeight: 'calc(100vh - 220px)',
      }}
    >
      <ProfileHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        role="super_admin"
        subtitle="لوحة الإدارة — سوبر أدمن"
        badges={badges}
      />
      <ProfileTabs
        auditEvents={events}
        profileContent={
          <>
            <AdminProfileForm
              initial={{
                displayName: profile.display_name,
                avatarUrl: profile.avatar_url,
                role: 'super_admin',
                phoneVerified: !!profile.phone_verified_at,
                email: session.email,
                createdAt: profile.created_at,
              }}
            />
            {privacy && <PrivacySection initial={privacy} context="admin" />}
          </>
        }
      />
    </div>
  )
}
