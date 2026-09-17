import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import SettingsClient from './SettingsClient'
import './settings.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعدادات المنصة' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect('/admin/login')
  const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', user.user.id).maybeSingle()
  if (role?.role !== 'super_admin') redirect('/')

  const { data: settings } = await supabase.from('platform_settings').select('key,value')

  const map: Record<string, any> = {}
  for (const row of settings ?? []) map[row.key] = row.value

  return (
    <main className="settings">
      <header className="settings__hero">
        <Link href="/admin" className="settings__back">← غرفة التحكم</Link>
        <span className="settings__kicker">إعدادات المنصة</span>
        <h1 className="settings__title">⚙️ الإعدادات العامة</h1>
        <p className="settings__sub">تحكم في كل الأرقام والمدد من مكان واحد</p>
      </header>
      <SettingsClient initial={map} />
    </main>
  )
}
