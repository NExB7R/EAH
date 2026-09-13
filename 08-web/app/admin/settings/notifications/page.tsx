import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import NotificationsPanel from '@/components/notifications-panel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة الإشعارات' }

const SCOPES = [
  { key: 'customer', label: '👤 العملاء', color: '#A855F7' },
  { key: 'merchant', label: '🏪 التجار', color: '#4ADE80' },
  { key: 'admin',    label: '👑 الأدمن', color: '#FBBF24' },
]

export default async function AdminNotificationsSettingsPage() {
  const supabase = await createClient()
  const { data: u } = await supabase.auth.getUser()
  if (!u.user) redirect('/admin/login')
  const { data: r } = await supabase.from('user_roles').select('role').eq('user_id', u.user.id).maybeSingle()
  if (r?.role !== 'super_admin') redirect('/')

  const { data: allTypes } = await supabase.from('notification_types').select('*').order('role_scope').order('sort_order')
  const { data: profile } = await supabase.from('profiles').select('notif_prefs').eq('id', u.user.id).maybeSingle()
  const prefs = (profile?.notif_prefs ?? {}) as Record<string, boolean>

  return (
    <section style={{ maxWidth: 1000 }}>
      <header className="eah-admin-page-header">
        <div>
          <span className="eah-admin-kicker">NOTIFICATIONS CONTROL</span>
          <h1>🛡️ إدارة الإشعارات</h1>
          <p>تحكم كامل في كل أنواع الإشعارات — من يراها ومتى</p>
        </div>
        <Link href="/admin" className="eah-admin-btn">← لوحة التحكم</Link>
      </header>

      {SCOPES.map(scope => {
        const types = (allTypes ?? []).filter(t => t.role_scope === scope.key)
        if (types.length === 0) return null
        return (
          <div key={scope.key} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: '.95rem', fontWeight: 900, color: scope.color, marginBottom: 12, paddingRight: 4 }}>
              {scope.label} ({types.length})
            </h2>
            <NotificationsPanel
              types={types}
              initialPrefs={prefs}
              role={scope.key as any}
              adminMode
            />
          </div>
        )
      })}
    </section>
  )
}
