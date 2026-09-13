import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const metadata = { title: 'تواصل معنا | EAH' }

export default function ContactPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="static-page">
        <Link href="/" className="static-page__back">← الرئيسية</Link>
        <span className="static-page__kicker">CONTACT</span>
        <h1 className="static-page__title">تواصل معنا</h1>

        <div className="static-page__content">
          <p>عندك اقتراح، سؤال، أو عايز تسجّل متجرك على المنصة؟ كلمنا.</p>

          <h2>📞 أرقام التواصل</h2>
          <p>واتساب: <a href="https://wa.me/201012892806" target="_blank" rel="noopener noreferrer">01012892806</a></p>

          <h2>📘 فيسبوك</h2>
          <p><a href="https://facebook.com/eah" target="_blank" rel="noopener noreferrer">facebook.com/eah</a></p>

          <h2>👨‍💼 أصحاب المتاجر</h2>
          <p>
            لو عايز تسجّل مطعمك أو صيدليتك أو محلك على EAH، ابدأ من{' '}
            <Link href="/merchant/apply">صفحة التسجيل</Link>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
