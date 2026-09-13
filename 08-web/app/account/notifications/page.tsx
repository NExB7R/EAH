import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import NotificationsPanel from '@/components/notifications-panel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعدادات الإشعارات | EAH' }

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
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '100px 20px 60px' }}>
        <header style={{ position: 'relative', textAlign: 'center', marginBottom: 24, padding: 16 }}>
          <Link href="/account" style={{ position: 'absolute', top: 16, right: 16, padding: '6px 12px', borderRadius: 10, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', color: '#C4B5FD', textDecoration: 'none', fontSize: '.78rem', fontWeight: 700 }}>← حسابي</Link>
          <span style={{ fontSize: '.7rem', letterSpacing: '.2em', color: '#A855F7', fontWeight: 800 }}>NOTIFICATIONS</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#F5F3FF', margin: '8px 0 8px' }}>🔔 الإشعارات</h1>
          <p style={{ color: '#A5A3B8', fontSize: '.9rem', margin: 0 }}>تحكم كامل في تنبيهاتك</p>
        </header>

        <NotificationsPanel types={types} initialPrefs={prefs} role="customer" />
      </main>
      <SiteFooter />
    </>
  )
}
