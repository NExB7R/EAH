import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import StudioEditorWrapper from '@/components/studio/editor-wrapper'
import { currentHomeDesign } from '@/components/studio/current-design'
import type { DesignData } from '@/components/studio/types'

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

  const raw = data?.data as any
  const initial: DesignData =
    raw && Array.isArray(raw.sections) && raw.sections.length > 0
      ? (raw as DesignData)
      : currentHomeDesign

  return <StudioEditorWrapper initial={initial} />
}
