import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/data/user'
import { getFullProfile } from '@/lib/data/account'
import AccountPageHeader from '@/components/account-page-header'
import EditProfileForm from './edit-form'

export default async function EditPage() {
  const session = await getUserSession()
  if (!session) redirect('/auth?next=/account/edit')

  const profile = await getFullProfile(session.userId)
  if (!profile) redirect('/auth?next=/account/edit')

  return (
    <div>
      <AccountPageHeader
        title="تعديل البيانات"
        description="عدّل بياناتك الشخصية"
      />
      <EditProfileForm
        initial={{
          displayName: profile.display_name,
          gender: profile.gender,
          bio: profile.bio,
        }}
      />
    </div>
  )
}
