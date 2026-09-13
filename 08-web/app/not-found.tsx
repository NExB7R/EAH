import Link from 'next/link'
import EahLogo from '@/components/eah-logo'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import './not-found.css'

export default function NotFound() {
  return (
    <>
      <FloatingCapsuleHeader />
      <main className="nf">
        <div className="nf__glow" aria-hidden />
        <div className="nf__logo">
          <EahLogo size="lg" variant="full" href="/" />
        </div>
        <h1 className="nf__code">404</h1>
        <h2 className="nf__title">الصفحة مش موجودة</h2>
        <p className="nf__text">يمكن الرابط غلط، أو الصفحة اتنقلت.</p>
        <div className="nf__actions">
          <Link href="/" className="nf__btn nf__btn--primary">الرئيسية</Link>
          <Link href="/explore" className="nf__btn">اكتشف الأماكن</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
