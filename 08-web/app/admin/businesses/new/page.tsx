import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BusinessForm from '@/components/admin/business-form'
import { createBusiness } from '../actions'

export const metadata = { title: 'إضافة مكان | EAH Admin' }

export default async function NewBusinessPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">NEW BUSINESS</span>
          <h1 className="admin-header__title">➕ إضافة مكان جديد</h1>
          <p className="admin-header__subtitle">
            املأ البيانات الأساسية — تقدر تعدّلها في أي وقت بعد كده
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin/businesses" className="admin-btn admin-btn--ghost">
            ← رجوع للأنشطة
          </Link>
        </div>
      </div>

      <BusinessForm mode="create" action={createBusiness} />
    </>
  )
}
