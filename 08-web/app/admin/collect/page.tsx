import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import CollectClient from './CollectClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'جمع أماكن' }

export default async function CollectPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: recent } = await supabase
    .from('businesses')
    .select('id,name,slug,business_type,area,created_at')
    .order('created_at', { ascending: false })
    .limit(15)

  return <CollectClient recent={recent ?? []} />
}
