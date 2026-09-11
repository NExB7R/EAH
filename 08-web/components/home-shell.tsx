import Link from 'next/link'
import InstallPrompt from '@/components/install-prompt'
import NotificationOptIn from '@/components/notification-optin'
import SmartHeader from '@/components/smart-header'
import EahHomeContent from '@/components/eah-home-content'
import { getPublishedBusinesses } from '@/lib/data'

export default async function HomeShell() {
  const businesses = await getPublishedBusinesses(8)

  return (
    <div className="shell">
      <SmartHeader />

      <main className="container">
        <EahHomeContent businesses={businesses} />
        <div className="home-utility-stack">
          <InstallPrompt />
          <NotificationOptIn />
        </div>
        <footer className="site-foot"><span id="about">عن EAH</span><span id="contact">تواصل معنا</span><span id="terms">الشروط</span><span id="privacy">الخصوصية</span><span>© EAH</span></footer>
      </main>

      <Link className="quick-cta" href="/auth">سجّل بسرعة <span aria-hidden="true">⚡</span></Link>

      <nav className="bottomnav" aria-label="التنقل الرئيسي">
        <Link className="navitem active" href="/">الرئيسية</Link>
        <Link className="navitem" href="/explore">اكتشف</Link>
        <Link className="navitem" href="/explore?mode=favorites">مفضلاتك</Link>
        <Link className="navitem" href="/auth">حسابك</Link>
      </nav>
    </div>
  )
}
