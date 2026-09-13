import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminShell from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) redirect('/admin/login')

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (roleError) throw new Error(`Unable to read admin role: ${roleError.message}`)
  if (roleRow?.role !== 'super_admin') redirect('/?admin=denied')

  const { count: pendingChanges } = await supabase
    .from('business_change_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return <AdminShell pendingChanges={pendingChanges ?? 0}>{children}</AdminShell>
}
