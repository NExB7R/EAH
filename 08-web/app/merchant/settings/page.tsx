import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import NotificationPreferences from '@/components/notification-preferences'
import EnablePushButton from '@/components/enable-push-button'
import { getMerchantContext } from '@/lib/admin/merchant-guard'
import './settings.css'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إعدادات المتجر | EAH' }

const DEFAULT_PREFS = {
  review_new: true, reveal_new: true, offer_approved: true,
  points_earned: true, streak_reminder: true, system_updates: true,
  marketing: false, email_digest: false,
}

export default async function MerchantSettingsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/auth?next=/merchant/settings')

  const ctx = await getMerchantContext()
  if (!ctx || ctx.businesses.length === 0) redirect('/merchant/apply')

  const { data: profile } = await supabase
    .from('profiles').select('notif_prefs').eq('id', userData.user.id).maybeSingle()

  const prefs = { ...DEFAULT_PREFS, ...(profile?.notif_prefs ?? {}) }

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
        <NotificationPreferences initial={prefs} />

        <section className="mset__section">
          <h2 className="mset__section-title">🚀 إجراءات سريعة</h2>
          <div className="mset__actions">
            <Link href="/merchant" className="mset__action">🏪 لوحة النشاط</Link>
            <Link href="/account/edit" className="mset__action">✏️ تعديل البروفايل</Link>
            <Link href="/auth/change-password" className="mset__action">🔒 كلمة المرور</Link>
            <Link href="/notifications" className="mset__action">🔔 الإشعارات</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
