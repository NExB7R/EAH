import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import StudioShell from '@/components/studio/shell'
import { defaultDesign, type DesignData } from '@/components/studio/types'
import './studio.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'استوديو التصميم | EAH Admin' }

export default async function AdminStudioPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()

  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data } = await supabase
    .from('site_designs')
    .select('data')
    .eq('key', 'home')
    .maybeSingle()

  const initial: DesignData =
    data?.data && typeof data.data === 'object' && 'sections' in (data.data as any)
      ? (data.data as DesignData)
      : defaultDesign()

  return <StudioShell initial={initial} />
}
