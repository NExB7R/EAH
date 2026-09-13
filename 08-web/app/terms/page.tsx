import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'

export const metadata = { title: 'الشروط والأحكام' }

export default function TermsPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="static-page">
        <Link href="/" className="static-page__back">← الرئيسية</Link>
        <span className="static-page__kicker">TERMS</span>
        <h1 className="static-page__title">الشروط والأحكام</h1>

        <div className="static-page__content">
          <h2>1. قبول الشروط</h2>
          <p>باستخدامك لمنصة EAH، أنت موافق على الشروط دي. لو مش موافق، من فضلك متستخدمش المنصة.</p>

          <h2>2. حساب المستخدم</h2>
          <p>لازم تكون 13 سنة على الأقل. أنت مسؤول عن سرية بيانات حسابك.</p>

          <h2>3. المحتوى</h2>
          <p>
            ممنوع تنشر أي محتوى مسيء، مضلل، أو مخالف للقانون. EAH بتحتفظ بحق حذف أي محتوى بدون إشعار.
          </p>

          <h2>4. التقييمات</h2>
          <p>
            التقييمات لازم تكون صادقة. ممنوع تلاعب أو تقييمات وهمية. المنصة بتحتفظ بحق حظر أي حساب
            بيخالف القواعد.
          </p>

          <h2>5. الخصوصية</h2>
          <p>
            بنحتفظ ببياناتك حسب <Link href="/privacy">سياسة الخصوصية</Link>.
          </p>

          <h2>6. التعديلات</h2>
          <p>
            EAH بتحتفظ بحق تعديل الشروط دي في أي وقت. الإصدارات الجديدة بتنشر على الصفحة دي.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
