import Link from 'next/link'
import FloatingCapsuleHeader from '@/components/floating-capsule'
import SiteFooter from '@/components/site-footer'
import BackToTop from '@/components/back-to-top'
import PointsExplainer from '@/components/points-explainer'

export const metadata = { title: 'نبذة عننا | EAH' }

export default function AboutPage() {
  return (
    <>
      <FloatingCapsuleHeader />
      <BackToTop />
      <main className="static-page">
        <Link href="/" className="static-page__back">← الرئيسية</Link>
        <span className="static-page__kicker">ABOUT</span>
        <h1 className="static-page__title">نبذة عننا</h1>

        <div className="static-page__content">
          <p>
            <strong>EAH</strong> منصة اكتشاف محلية بدأت من <strong>شبين القناطر</strong>، هدفها توصّلك لأقرب
            مطعم، صيدلية، أو مكتب توصيل يناسبك — بسرعة وبساطة.
          </p>

          <h2>ليه EAH؟</h2>
          <p>
            لأن الناس في القرى والمدن الصغيرة بيضيّعوا وقت كبير يدوروا على حاجة قريبة منهم. EAH بتجمعلك
            كل الأماكن في مكان واحد، بتفهم مزاجك، وترشحلك اللي يناسبك.
          </p>

          <h2>إيه اللي بنقدمه؟</h2>
          <ul>
            <li>اكتشاف سريع لأماكن قريبة منك</li>
            <li>تقييمات مفصلة (طعم، قيمة، سرعة، تجربة)</li>
            <li>عروض حصرية من المطاعم والمحلات</li>
            <li>ترشيح ذكي حسب مزاجك وميزانيتك</li>
            <li>دعم للأماكن الصغيرة والجديدة</li>
          </ul>

          <h2>رؤيتنا</h2>
          <p>
            نخلي كل مكان صغير في مصر عنده فرصة يوصّل خدمته للناس بطريقة حديثة وسهلة.
          </p>
        </div>
      </main>
      <PointsExplainer />
      <SiteFooter />
    </>
  )
}
