import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import VerificationCard from './verification-card'
import './verifications.css'
import { IcCheck } from '@/components/eah-icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'طلبات التوثيق' }

export default async function AdminVerificationsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles').select('role').eq('user_id', userData.user.id).maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const { data: requests } = await supabase
    .from('verification_requests')
    .select(`
      id,user_id,real_name,national_id,reason,status,admin_note,created_at,reviewed_at,
      profile:profiles!verification_requests_user_id_fkey (display_name,phone,trust_score,created_at)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const pending = (requests ?? []).filter(r => r.status === 'pending')
  const done = (requests ?? []).filter(r => r.status !== 'pending')

  return (
    <section>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">التوثيق</span>
          <h1><IcCheck /> طلبات التوثيق</h1>
          <p>{pending.length} طلب قيد المراجعة</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      {pending.length === 0 && done.length === 0 && (
        <div className="admin-empty">
          <span className="admin-empty__emoji"></span>
          <h2 className="admin-empty__title">مفيش طلبات</h2>
          <p className="admin-empty__msg">لما حد يقدم طلب توثيق هيظهر هنا</p>
        </div>
      )}

      {pending.length > 0 && (
        <>
          <h2 className="admin-section-title">قيد المراجعة ({pending.length})</h2>
          <div className="vf-admin-list">
            {pending.map(r => (
              <VerificationCard key={r.id} request={r as any} />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="admin-section-title" style={{ marginTop: 32 }}>
            تمت المراجعة ({done.length})
          </h2>
          <div className="vf-admin-list">
            {done.map(r => (
              <VerificationCard key={r.id} request={r as any} readOnly />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
