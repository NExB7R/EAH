import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import EditClient from './edit-client'
import './edit.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'تعديل البروفايل' }

export default async function EditProfilePage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name,avatar_key,bio,phone,gender,avatar_url,verified_at')
    .eq('id', userData.user.id)
    .maybeSingle()

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  return (
    <>
      <FloatingCapsuleHeader />
      <EditClient
        userId={userData.user.id}
        initial={{
          name: profile?.display_name ?? '',
          bio: profile?.bio ?? '',
          gender: (profile?.gender as 'male' | 'female' | null) ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          avatarKey: profile?.avatar_key ?? null,
          isVerified: !!profile?.verified_at,
          role: roleRow?.role ?? 'customer',
        }}
      />
      <SiteFooter />
    </>
  )
}
