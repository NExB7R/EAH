import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import NotificationsPanel from '@/components/notifications-panel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الإشعارات' }

export default async function AdminNotificationsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/admin/login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle()
  if (roleRow?.role !== 'super_admin') redirect('/')

  const [typesRes, profileRes] = await Promise.all([
    supabase
      .from('notification_types')
      .select('*')
      .eq('is_globally_active', true)
      .order('sort_order'),
    supabase
      .from('profiles')
      .select('notif_prefs')
      .eq('id', userData.user.id)
      .maybeSingle(),
  ])

  const types = typesRes.data ?? []
  const prefs = (profileRes.data?.notif_prefs ?? {}) as Record<string, boolean>

  return (
    <>
      <div className="admin-header">
        <div className="admin-header__info">
          <span className="admin-header__kicker">الإشعارات</span>
          <h1 className="admin-header__title">🔔 إدارة الإشعارات</h1>
          <p className="admin-header__subtitle">
            تفضيلاتك الشخصية + كل الأنواع المتاحة على المنصة
          </p>
        </div>
        <div className="admin-header__actions">
          <Link href="/admin" className="admin-btn admin-btn--ghost">← لوحة التحكم</Link>
        </div>
      </div>

      <NotificationsPanel
        types={types}
        initialPrefs={prefs}
        role="super_admin"
        adminMode
      />
    </>
  )
}
