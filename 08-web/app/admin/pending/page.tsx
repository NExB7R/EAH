import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PendingClient from './PendingClient'
import './pending.css'
import { IcInbox } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'الطلبات المعلقة' }

export default async function AdminPendingPage() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')

  const { data: r } = await supabase
    .from('user_roles').select('role').eq('user_id', u.user.id).maybeSingle()
  if (r?.role !== 'super_admin') redirect('/')

  const { data: rows } = await supabase
    .from('pending_changes')
    .select('id,action,entity_type,entity_id,payload,before_data,requested_by,created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(100)

  const requesterIds = [...new Set((rows ?? []).map((x: any) => x.requested_by))]
  const { data: profiles } = requesterIds.length
    ? await supabase.from('profiles').select('id,display_name,phone').in('id', requesterIds)
    : { data: [] as any[] }
  const pmap = new Map((profiles ?? []).map((p: any) => [p.id, p]))

  const items = (rows ?? []).map((row: any) => ({
    ...row,
    requester_name: pmap.get(row.requested_by)?.display_name ?? null,
    requester_phone: pmap.get(row.requested_by)?.phone ?? null,
  }))

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">الطلبات</span>
          <h1 className="admin-header__title">الطلبات المعلقة</h1>
          <p className="admin-header__subtitle">
            {items.length === 0
              ? 'مفيش طلبات معلقة'
              : `${items.length} طلب محتاج قرار`}
          </p>
        </div>
      </header>
      <PendingClient items={items} />
    </section>
  )
}
