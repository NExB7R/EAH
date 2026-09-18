import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import PointsClient from './PointsClient'
import './points.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة النقاط' }

export default async function AdminPointsPage() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')

  const { data: r } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', u.user.id)
    .maybeSingle()

  if (r?.role !== 'super_admin') redirect('/')

  return (
    <section>
      <header className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">النقاط</span>
          <h1 className="admin-header__title">إدارة نقاط المستخدمين</h1>
          <p className="admin-header__subtitle">
            ابحث بالرقم أو الاسم، وشوف الرصيد، وعدّل النقاط
          </p>
        </div>
      </header>

      <div className="admin-card">
        <PointsClient />
      </div>
    </section>
  )
}
