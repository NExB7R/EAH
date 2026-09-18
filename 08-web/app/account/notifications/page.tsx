import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import NotificationsPanel from '@/components/notifications-panel'
import { IcBell } from '@/components/eah-icons'
import './notifications.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعدادات الإشعارات' }

export default async function CustomerNotificationsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/account/notifications')

  const [typesRes, profileRes] = await Promise.all([
    supabase.from('notification_types').select('*').in('role_scope', ['customer', 'all']).eq('is_globally_active', true).order('sort_order'),
    supabase.from('profiles').select('notif_prefs').eq('id', userData.user.id).maybeSingle(),
  ])

  const types = typesRes.data ?? []
  const prefs = (profileRes.data?.notif_prefs ?? {}) as Record<string, boolean>

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="nt">
        <header className="nt__hero">
          <Link href="/account" className="nt__back">← حسابي</Link>
          <span className="nt__kicker">الإشعارات</span>
          <h1 className="nt__title e-gradient">
            <IcBell /> الإشعارات
          </h1>
          <p className="nt__sub">تحكم كامل في تنبيهاتك — اختار اللي يهمك</p>
        </header>

        <NotificationsPanel types={types} initialPrefs={prefs} role="customer" />
      </main>
      <SiteFooter />
    </>
  )
}
