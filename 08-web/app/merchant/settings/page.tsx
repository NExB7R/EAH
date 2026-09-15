import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import EnablePushButton from '@/components/enable-push-button'
import NotificationsPanel from '@/components/notifications-panel'
import { getMerchantContext } from '@/lib/admin/merchant-guard'
import './settings.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعدادات المتجر' }

export default async function MerchantSettingsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant/settings')

  const ctx = await getMerchantContext()
  if (!ctx || ctx.businesses.length === 0) redirect('/merchant/apply')

  const [typesRes, profileRes, subRes] = await Promise.all([
    supabase
      .from('notification_types')
      .select('*')
      .in('role_scope', ['merchant', 'all'])
      .eq('is_globally_active', true)
      .order('sort_order'),
    supabase
      .from('profiles')
      .select('notif_prefs')
      .eq('id', userData.user.id)
      .maybeSingle(),
    // ✅ فحص اشتراك نشط
    supabase
      .from('business_subscriptions')
      .select('status,expires_at')
      .eq('owner_id', userData.user.id)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .limit(1)
      .maybeSingle(),
  ])

  const types = typesRes.data ?? []
  const prefs = (profileRes.data?.notif_prefs ?? {}) as Record<string, boolean>
  const isPremium = !!subRes.data

  return (
    <>
      <FloatingCapsuleHeader />
      <main className="mset">
        <header className="mset__hero">
          <Link href="/merchant" className="mset__back">← لوحة النشاط</Link>
          <span className="mset__kicker">MERCHANT</span>
          <h1 className="mset__title">⚙️ إعدادات المتجر</h1>
          <p className="mset__sub">تحكم كامل في تجربتك على EAH</p>
        </header>

        <EnablePushButton />

        <NotificationsPanel types={types} initialPrefs={prefs} role="merchant" isPremium={isPremium} />

        <section className="mset__section">
          <h2 className="mset__section-title">🚀 إجراءات سريعة</h2>
          <div className="mset__actions">
            <Link href="/merchant" className="mset__action">🏪 لوحة النشاط</Link>
            <Link href="/merchant/qr" className="mset__action">📱 QR Code</Link>
            <Link href="/account/edit" className="mset__action">✏️ تعديل البروفايل</Link>
            <Link href="/auth/change-password" className="mset__action">🔒 كلمة المرور</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
